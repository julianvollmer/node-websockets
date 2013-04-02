var util = require('util');
var stream = require('stream');
var crypto = require('crypto');

var rparser = require('./parser/read');
var wparser = require('./parser/write');

util.inherits(WebSocket, stream.Duplex);

function WebSocket(source, options) {
    options = options || {};

    var self = this;

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

    // frame states required for parsing and writing
    this._frameReadState = new FrameReadState(options);
    this._frameWriteState = new FrameWriteState(options);

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
    frameDefaultFlags(this, options);
}

function FrameWriteState(options) {
    options = options || {};

    // we need to know if this is the
    // first frame written of the sequence
    this.first = true;

    frameDefaultFlags(this, options);
}

function frameDefaultFlags(state, options) {
    options = options || {};

    // frame flag defaults
    state.fin = false;
    state.mask = false;
    state.rsv1 = false;
    state.rsv2 = false;
    state.rsv3 = false;
    state.mask = false;
    
    // frame opcode and lenth defaults
    state.opcode = 0x01;
    state.length = 0x00;

    // masking dummy
    state.masking = new Buffer(0);

    if (options.mask)
        state.mask = options.mask;
}

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

WebSocket.prototype.writeEnd = function(chunk) {
    this._frameWriteState.fin = true;

    return this.write(chunk);
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

module.exports = WebSocket;

function parseHead(stream, state, chunk) {
    // copy each chunk to an array
    for (var i = 0; i < chunk.length; i++)
        state.headBytes.push(chunk[i]);

    var head = new Buffer(state.headBytes);

    // parsed the head if there are enough
    // bytes and we not already done it
    if (!state.hadHead && head.length > 1) {
        rparser.parseFirstHeadByte(state, head);
        rparser.parseSecondHeadByte(state, head);
        state.hadHead = true;
    }

    // if we collected enough bytes to match
    // the headSize parse the additional headers
    // we have to additionally test against headSize
    // to be sure it is not the default value null
    if (state.headSize && head.length >= state.headSize) {
        rparser.parseAdditionalHeadBytes(state, head);
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
        stream.emit('done');
        // push back possible too much chunk
        pushBackTooMuchChunk(stream, state, chunk, i);
    }
}

function createHead(state, chunk) {
    var lengthBytes = wparser.createLengthBytes(state, chunk);
    var firstBytes = wparser.createFirstBytes(state, chunk);
    var maskingBytes = wparser.createMaskingBytes(state, chunk);

    var headBytes = [firstBytes, lengthBytes, maskingBytes];

    return Buffer.concat(headBytes);
}

function createBody(state, chunk) {
    var payload = chunk;
    var masking = state.masking;

    return mask(masking, payload);
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
