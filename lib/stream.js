var util = require('util');
var stream = require('stream');

util.inherits(WebSocketStream, stream.Duplex);

function FrameState(options) {
    options = options || {};

    // TODO:
    // * add description to flags
    // * some flags are unneccesary
    this.fin = true;
    this.rsv1 = false;
    this.rsv2 = false;
    this.rsv3 = false;
    this.mask = false;
    this.body = false;

    this.index = 0;
    this.opcode = 0;
    this.length = 0;
    this.parsed = 0;
    this.headSize = 0;

    this.masking = new Buffer(0);
}

function WebSocketStream(socket, options) {
    options = options || {};

    var self = this;
 
    // frame states required for parsing and writing
    this.readFrameState = new FrameState(options);
    this.writeFrameState = new FrameState(options);

    // bind to socket
    this.socket = socket;
    this.socket.on('readable', function() {
        self.read(0);
    });
    this.socket.on('end', function() {
        self.push(null);
    });

    stream.Duplex.call(this, options);
}

WebSocketStream.prototype._read = function() {
    var state = this.readFrameState;
    var chunk = this.socket.read();

    // push something to keep reading but return
    if (chunk === null)
        return this.push('');

    if (!state.body) {
        parseHead(this, state, chunk);
        this.emit('head', state);
    } else { 
        parseBody(this, state, chunk);
    }
};

WebSocketStream.prototype._write = function(chunk, encoding, done) {
    this.socket.write(chunk, function() {
        done(null);
    });
};

module.exports = WebSocketStream;

function parseHead(stream, state, chunk) {
    // TODO: this can break the reading because
    // unshift will not emit readable while reading
    // we only want to parse complete head bytes
    //if (!hasAllHeadBytes(chunk)) {
    //    this.socket.unshift(chunk);
    //    return this.push('');
    //}

    // will parse the header bytes to know 
    // what the frame is about
    parseFirstHeadByte(state, chunk);
    parseSecondHeadByte(state, chunk);
    parseAdditionalHeadBytes(state, chunk);

    // on next _read call the chunk should
    // be interpreted as body
    state.body = true;

    pushBackTooMuchChunk(stream, state, chunk, state.headSize);
}

function parseBody(stream, state, chunk) {
    // keep track of how much body bytes we are parsing
    // so we know when there is coming a new frame
    state.parsed += chunk.length;
    
    // TODO: improve the var management
    var remnant = chunk.slice(chunk.length);
    var payload = chunk.slice(0, chunk.length);

    // else push the unmasked chunk to read queue
    stream.push(mask(state.index, state.masking, payload));
    state.index += chunk.length - 1;

    // if amount of parsed bytes equals or exceeds the frame 
    // length we are reaching the end of our payload and it
    // can be that a new frame is at the end of chunk and
    // need to push the new frame back on the, reset the
    // frame flags and update the chunk to represent the
    // last part of the payload to get furtherly parsed
    // TODO: improve var management
    if (state.parsed >= state.length) {
        state.body = false;
        state.index = 0;
        state.parsed = 0;
        state.headSize = 0;
        pushBackTooMuchChunk(stream, state, remnant, 0);
    }
}

function hasAllHeadBytes(chunk) {
    var headSize = calcHeadSize(chunk);

    return chunk.length >= headSize;
}

function parseFirstHeadByte(state, chunk) {
    state.fin = !!(chunk[0] & 0x80);
    state.rsv1 = !!(chunk[0] & 0x40);
    state.rsv2 = !!(chunk[0] & 0x20);
    state.rsv3 = !!(chunk[0] & 0x10);
    state.opcode = chunk[0] & 0x0f;
}

function parseSecondHeadByte(state, chunk) {
    state.mask = !!(chunk[1] & 0x80);
    state.length = chunk[1] & 0x7f;
    state.headSize = calcHeadSize(chunk);
}

function calcHeadSize(chunk) {
    // minimum byte size is two
    var size = 2;
    // does the frame has a masking
    var mask = !!(chunk[1] & 0x80);
    // length for additional length bytes
    var length = chunk[1] & 0x7f;

    // if length is 126 or 127 the frame
    // has two or eight additional bytes
    // to describe bigger lengths
    switch (length) {
        case 126:
            size += 2;
            break;
        case 127:
            size += 8;
    }

    // if frame is masked it will have four
    // additional masking bytes
    if (mask)
        size += 4;

    return size;
}

function parseAdditionalHeadBytes(state, chunk) {
    var length = state.length;
    var headSize = state.headSize;
    var masking = new Buffer(0);

    switch (length) {
        // if length in byte two is 126 then
        // the next two bytes should be interpreted
        // as 16 bit unsigned integer big endian
        case 126:
            length = chunk.readUInt16BE(2);
            break;
        // if length in byte two is 127 then
        // the next eight bytes should be interpreted
        // as 64 bit unsigned integer big endian
        // but because js can't handle 64bit uinsigned
        // integers we will only read the length to 32 bit
        // BUG: frames with length above 0xffffffff will be
        // interpreted wrong
        // TODO: emit an error and quit this connection
        case 127:
            length = chunk.readUInt32BE(6);
            break;
    }

    if (state.mask)
        // extract the four bytes sized masking key
        masking = chunk.slice(headSize - 4, headSize);

    state.length = length;
    state.masking = masking;
}

function pushBackTooMuchChunk(stream, state, chunk, offset) {
    // if chunk contains more data then we actually want
    // to intepret we can use this helper to push them
    // back in the socket
    if (chunk.length > offset) {
        if (!state.body)
            parseHead(stream, state, chunk.slice(offset));
        else
            parseBody(stream, state, chunk.slice(offset));
    }
}

function mask(index, masking, payload) {
    // because we stream the body of each frame
    // we need an index value to know which masking
    // byte we should use for bit shifting
    var length = payload.length;
    var unmasked = new Buffer(length);

    for (var i = 0; i < length; i++)
        unmasked[i] = payload[i] ^ masking[(index + i) % 4];

    return unmasked;
}
