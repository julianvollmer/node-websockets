var util = require('util');
var stream = require('stream');

function WebSocketStream(socket, options) {
    options = (options || {});

    var self = this;
 
    // reset frame markers
    resetFrameFlags(this);

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

util.inherits(WebSocketStream, stream.Duplex);

WebSocketStream.prototype._read = function() {
    var chunk = this.socket.read();

    // push something to keep reading but return
    if (chunk === null)
        return this.push('');

    if (!this.isBody) {
        parseHead.call(this, chunk);
        emitHead(this);
    } else { 
        parseBody.call(this, chunk);
    }
};

module.exports = WebSocketStream;

function emitHead(stream) {
    var head = {};
    
    head.fin = stream.fin;
    head.rsv1 = stream.rsv1;
    head.rsv2 = stream.rsv2;
    head.rsv3 = stream.rsv3;
    head.mask = stream.mask;
    head.opcode = stream.opcode;
    head.length = stream.length;
    head.masking = stream.masking;
    head.headSize = stream.headSize;

    stream.emit('head', head);
}

function parseHead(chunk) {
    // TODO: this can break the reading because
    // unshift will not emit readable while reading
    // we only want to parse complete head bytes
    //if (!hasAllHeadBytes(chunk)) {
    //    this.socket.unshift(chunk);
    //    return this.push('');
    //}

    // will parse the header bytes to know 
    // what the frame is about
    parseFirstHeadByte(this, chunk);
    parseSecondHeadByte(this, chunk);
    parseAdditionalHeadBytes(this, chunk);

    // on next _read call the chunk should
    // be interpreted as body
    this.isBody = true;

    pushBackTooMuchChunk(this, chunk, this.headSize);
}

function parseBody(chunk) {
    // keep track of how much body bytes we are parsing
    // so we know when there is coming a new frame
    this.parsed += chunk.length;
    
    // TODO: improve the var management
    var remnant = chunk.slice(chunk.length);
    var payload = chunk.slice(0, chunk.length);

    // else push the unmasked chunk to read queue
    this.push(mask(this.index, this.masking, payload));
    this.index += chunk.length - 1;

    // if amount of parsed bytes equals or exceeds the frame 
    // length we are reaching the end of our payload and it
    // can be that a new frame is at the end of chunk and
    // need to push the new frame back on the, reset the
    // frame flags and update the chunk to represent the
    // last part of the payload to get furtherly parsed
    // TODO: improve var management
    if (this.parsed >= this.length) {
        resetFrameFlags(this);
        var tooMuch = this.parsed - this.length;
        pushBackTooMuchChunk(this, remnant, 0);
    }
}

function hasAllHeadBytes(chunk) {
    var headSize = calcHeadSize(chunk);

    return chunk.length >= headSize;
}

function parseFirstHeadByte(stream, chunk) {
    stream.fin = !!(chunk[0] & 0x80);
    stream.rsv1 = !!(chunk[0] & 0x40);
    stream.rsv2 = !!(chunk[0] & 0x20);
    stream.rsv3 = !!(chunk[0] & 0x10);
    stream.opcode = chunk[0] & 0x0f;
}

function parseSecondHeadByte(stream, chunk) {
    stream.mask = !!(chunk[1] & 0x80);
    stream.length = chunk[1] & 0x7f;
    stream.headSize = calcHeadSize(chunk);
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

function parseAdditionalHeadBytes(stream, chunk) {
    var length = stream.length;
    var headSize = stream.headSize;
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

    if (stream.mask)
        // extract the four bytes sized masking key
        masking = chunk.slice(headSize - 4, headSize);

    stream.length = length;
    stream.masking = masking;
}

function resetFrameFlags(stream) {
    // because the masking algorithm relays
    // on the index we must keep track of it
    stream.index = 0;

    // this is a counter so we know when we 
    // have read enough of the body
    stream.parsed = 0;

    // this tells us if we are currently
    // getting body or header chunk
    stream.isBody = false;

    // frame flags
    stream.fin = true;
    stream.rsv1 = false;
    stream.rsv2 = false;
    stream.rsv3 = false;
    stream.mask = false;
   
    // frame opcode and length
    stream.opcode = null;
    stream.length = null;

    // frame masking buffer
    stream.masking = null;
}

function pushBackTooMuchChunk(stream, chunk, offset) {
    // if chunk contains more data then we actually want
    // to intepret we can use this helper to push them
    // back in the socket
    if (chunk.length > offset) {
        if (!stream.isBody)
            parseHead.call(stream, chunk.slice(offset));
        else
            parseBody.call(stream, chunk.slice(offset));
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
