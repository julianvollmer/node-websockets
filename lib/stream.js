var util = require('util');
var stream = require('stream');
var crypto = require('crypto');

util.inherits(WebSocket, stream.Duplex);

function WebSocket(source, options) {
    options = options || {};

    var self = this;
 
    // frame states required for parsing and writing
    this._frameReadState = new FrameReadState(options);
    this._frameWriteState = new FrameWriteState(options);

    // bind to socket
    this._source = source;

    // if the source emits a readable we can
    // begin starting to read from it by setting
    // read size to zero else it would return
    // the socket chunk directly in to the cb
    this._source.on('readable', function() {
        self.read(0);
    });

    // if the socket closes we will push null
    // to also end this stream
    this._source.on('end', function() {
        self.push(null);
    });

    // set up DuplexStream flags by
    // calling its constructor
    stream.Duplex.call(this, options);
}

function FrameReadState(options) {
    options = options || {};

    // tells us weither we currently 
    // parse the head or body bytes
    this.body = false;

    // counters which help us to
    // navigate in the body
    this.parsed = 0;
    this.missing = 0;

    // headSize contains the byte
    // size of all non-payload bytes
    // headBytes helps us to buffer
    // them in the case they are split
    this.headSize = 0;
    this.headBytes = [];

    // this will set up the actual frame
    // specific flags like fin, opcode, etc.
    FrameWriteState.call(this, options);
}

function FrameWriteState(options) {
    options = options || {};

    // frame flag defaults
    this.fin = true;
    this.mask = false;
    this.rsv1 = false;
    this.rsv2 = false;
    this.rsv3 = false;
    this.mask = false;
    
    // frame opcode and lenth defaults
    this.opcode = 0x01;
    this.length = 0x00;

    // masking dummy
    this.masking = new Buffer(0);
}

WebSocket.prototype._read = function() {
    var chunk = this._source.read();
    var state = this._frameReadState;
    
    // push something to keep reading but return
    if (chunk === null)
        return this.push('');

    if (!state.body) {
        parseHead(this, state, chunk);
    } else { 
        parseBody(this, state, chunk);
    }
};

WebSocket.prototype._write = function(chunk, encoding, done) {
    var state = this._frameWriteState;
    
    var headBytes = createHead(state, chunk);
    var bodyBytes = createBody(state, chunk);
    
    var frame = Buffer.concat([headBytes, bodyBytes]);

    this._source.write(frame, function() {
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
    // copy each chunk to an array
    for (var i = 0; i < chunk.length; i++)
        state.headBytes.push(chunk[i]);

    var head = new Buffer(state.headBytes);

    // parsed the head if there are enough
    // bytes and we not already done it
    if (!state.hadHead && head.length > 1) {
        parseFirstHeadByte(state, head);
        parseSecondHeadByte(state, head);
        state.hadHead = true;
    }

    // if we collected enough bytes to match
    // the headSize parse the additional headers
    // we have to additionally test against headSize
    // to be sure it is not the default value null
    if (state.headSize && head.length >= state.headSize) {
        parseAdditionalHeadBytes(state, head);
        // reset flags
        state.body = true;
        state.hadHead = false;
        // publish head states
        stream.emit('head', state);
        // reparse chunk which does not belong to the head
        pushBackTooMuchChunk(stream, state, chunk, state.headSize);
    }

    stream.push('');
}

function parseBody(stream, state, chunk) {
    var payload = chunk.slice(0, state.missing);

    // push the unmasked chunk to read queue
    stream.push(mask(state.masking, payload, state.parsed));
    
    // keep track of how much body bytes we are parsing
    // so we know when there is coming a new frame
    state.parsed += chunk.length;
    state.missing -= chunk.length;

    // if we reached the payload length
    // defined in the header it is time
    // to stop parsing the body and reset
    if (state.missing < 1) {
        // convert possible negative 
        // missing to positive value
        var i = ~state.missing;
        // reset flags
        state.body = false;
        state.parsed = 0;
        state.missing = 0;
        // inform about that the frame has ended
        stream.emit('fend');
        // push back possible too much chunk
        pushBackTooMuchChunk(stream, state, chunk, i);
    }
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
