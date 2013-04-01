var util = require('util');
var stream = require('stream');
var crypto = require('crypto');

util.inherits(WebSocket, stream.Duplex);

function WebSocket(socket, options) {
    options = options || {};

    var self = this;
 
    // frame states required for parsing and writing
    this._frameReadState = new FrameReadState(options);
    this._frameWriteState = new FrameWriteState(options);

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

function FrameReadState(options) {
    options = options || {};

    this.fin = false;
    this.rsv1 = false;
    this.rsv2 = false;
    this.rsv3 = false;
    this.mask = false;
    this.body = false;

    this.opcode = 0;
    this.length = 0;
    this.parsed = 0;
    this.missing = 0;
    this.headSize = 0;

    this.masking = new Buffer(0);
}

function FrameWriteState(options) {
    options = options || {};

    this.fin = true;
    this.mask = false;
    
    this.opcode = 0x01;
    this.length = 0x00;

    this.masking = new Buffer(0);
}

WebSocket.prototype._read = function() {
    var state = this._frameReadState;
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

WebSocket.prototype._write = function(chunk, encoding, done) {
    var state = this._frameWriteState;
    
    var headBytes = createHead(state, chunk);
    var bodyBytes = createBody(state, chunk);
    
    var frame = Buffer.concat([headBytes, bodyBytes]);

    this.socket.write(frame, function() {
        done(null);
    });
};

WebSocket.prototype.writeHead = function(head) {
    var state = this._frameWriteState;

    // undefined to accept false and bool
    // conversion for more security
    if (head.fin !== undefined)
        state.fin = !!head.fin;
    if (head.mask !== undefined)
        state.mask = !!head.mask;
    
    // only set opcode if in correct range
    if (head.opcode < 0x0b && 
       (head.opcode < 0x03 || head.opcode > 0x07))
        state.opcode = head.opcode;
    
    if (head.length)
        state.length = head.length;
    
    // only allow maskings who are buffers
    // with length of four
    if (Buffer.isBuffer(head.masking) && 
        head.masking.length == 4) {
        state.mask = true;
        state.masking = head.masking;
    }
};

module.exports = WebSocket;

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
    var payload = chunk.slice(0, state.missing);

    // else push the unmasked chunk to read queue
    stream.push(mask(state.masking, payload, state.parsed));
    // keep track of how much body bytes we are parsing
    // so we know when there is coming a new frame
    state.parsed += chunk.length;
    state.missing -= chunk.length;

    // if amount of parsed bytes equals or exceeds the frame 
    // length we are reaching the end of our payload and it
    // can be that a new frame is at the end of chunk and
    // need to push the new frame back on the, reset the
    // frame flags and update the chunk to represent the
    // last part of the payload to get furtherly parsed
    if (state.missing < 0) {
        var i = ~state.missing;
        state.body = false;
        state.parsed = 0;
        state.missing = 0;
        pushBackTooMuchChunk(stream, state, chunk, i);
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
    state.missing = length;
    state.masking = masking;
}

function createHead(state, chunk) {
    var lengthBytes = createLengthBytes(state, chunk);
    var firstBytes = createFirstBytes(state, chunk);
    var maskingBytes = createMaskingBytes(state, chunk);

    var headBytes = [firstBytes, lengthBytes, maskingBytes];

    return Buffer.concat(headBytes);
}

function createBody(state, chunk) {
    var payload = chunk;
    var masking = state.masking;

    return mask(masking, payload);
}

function createFirstBytes(state, chunk) {
    var opcode = state.opcode;
    var length = state.length;
    var firstBytes = new Buffer(2);

    firstBytes[0] = ((state.fin) ? 0x80 : 0x00) | opcode;
    firstBytes[1] = ((state.mask) ? 0x80 : 0x00) | length;
    
    return firstBytes;
}

function createLengthBytes(state, chunk) {
    var length = state.length;
    var lengthBytes = new Buffer(0);

    if (!length)
        length = chunk.length;

    if (length > 125 && length < 0x10000) {
        lengthBytes = new Buffer(2);
        lengthBytes.writeUInt16BE(length, 0);
        length = 126;
    } else if (length > 0xffff) {
        lengthBytes = new Buffer(8);
        lengthBytes.fill(0);
        lengthBytes.writeUInt32BE(length, 4);
        length = 127;
    }

    state.length = length;
    state.plength = chunk.length;

    return lengthBytes;
}

function createMaskingBytes(state, chunk) {
    var mask = state.mask;
    var masking = new Buffer(0);

    if (mask) {
        if (state.masking.length)
            masking = state.masking;
        else
            masking = crypto.randomBytes(4);
    }

    state.masking = masking;

    return masking;
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

function mask(masking, payload, offset) {
    offset = offset || 0;
    // because we stream the body of each frame
    // we need an index value to know which masking
    // byte we should use for bit shifting
    var length = payload.length;
    var masked = new Buffer(length);

    for (var i = 0; i < length; i++)
        masked[i] = payload[i] ^ masking[(offset + i) % 4];

    return masked;
}
