var util = require('util');
var stream = require('stream');
var crypto = require('crypto');
var parser = require('./parser');

util.inherits(WebSocketStream, stream.Duplex);

var emptyBuffer = new Buffer(0);

function WebSocketStream(source, options) {
    options = options || { opcode: 0x01 };

    var self = this;

    this._frameReadState = new FrameReadState(options);
    this._frameWriteState = new FrameWriteState(options);

    bindToSource(this, source, options);

    stream.Duplex.call(this, options);
}

function FrameReadState() {
    this.body = false;
    this.index = 0;
    this.headSize = 0;
    this.headBytes = [];
}

function FrameWriteState(options) {
    this.mask = false;
    this.opcode = 0x01;
    
    if (options.mask)
        this.mask = options.mask;
    if (options.opcode)
        this._opcode = options.opcode;
}

WebSocketStream.prototype.writeHead = function(options) {
    options = options || {};

    var state = this._frameWriteState;
    if (options.fin !== undefined)
        state.fin = !!options.fin;
    if (options.rsv1 !== undefined)
        state.rsv1 = !!options.rsv1;
    if (options.rsv2 !== undefined)
        state.rsv2 = !!options.rsv2;
    if (options.rsv3 !== undefined)
        state.rsv3 = !!options.rsv3;
    if (options.mask !== undefined)
        state.mask = !!options.mask;
    if (options.opcode < 0x10)
        state.opcode = options.opcode;
    if (options.masking && options.masking.length == 4) {
        state.mask = true;
        state.masking = options.masking;
    }

    return this;
};

WebSocketStream.prototype._read = function() {
    var chunk = this._source.read();
    var state = this._frameReadState;

    if (chunk === null)
        return this.push('');

    if (!state.body)
        parseHead(this, state, chunk);
    else
        parseBody(this, state, chunk);
};

WebSocketStream.prototype._write = function(chunk, encoding, done) {
    var state = this._frameWriteState;

    state.length = chunk.length;

    var frameBytes = [];
    frameBytes.push(parser.writeHeadBytes(state));
    frameBytes.push(parser.writeBodyBytes(state, chunk));

    // NOTE: doing write async can break frame order
    this._source.write(Buffer.concat(frameBytes));

    done(null);
};

module.exports = WebSocketStream;

function parseHead(stream, state, chunk) {
    var headSize = state.headSize;
    var headBytes = state.headBytes;

    // copy chunk bytes to the end of our head byte cache
    // NOTE: we use an array to be more flexible
    var s = headBytes.length;
    for (var i = 0; i < chunk.length; i++)
        headBytes[s + i] = chunk[i];

    // map our array from above to a buffer
    var headBuffer = new Buffer(headBytes);

    // calc headSize if not done and we have enough head bytes
    if (!headSize && headBuffer.length > 1)
        headSize = state.headSize = parser.calcHeadSize(headBuffer);
    
    // if headSize was calced and we have equal or more head bytes
    // we can parse the head completly and go on
    if (headSize && headBuffer.length >= headSize) {
        parser.readHeadBytes(state, headBuffer);
        // emit a head event if we have a real frame
        if (state.opcode != 0x00)
            emitHeadEvent(stream, state);
        
        // reset flags
        state.body = true;
        state.headSize = 0;
        state.headBytes = [];

        // if our chunk is bigger than the headSize it is
        // properly some body chunk so we call parseBody on it
        if (headBuffer.length >= headSize)
            parseBody(stream, state, chunk.slice(headSize));
    }

    stream.push('');
}

function parseBody(stream, state, chunk) {
    var body = parser.readBodyBytes(state, chunk);
    var remnant = chunk.slice(state.length);
    
    // push to readque
    stream.push(body);

    // if our index counter equals the length we have 
    // parsed all body bytes and maybe have new frame
    if (state.length == state.index) {
        state.body = false;
        state.index = 0;
        if (state.fin) stream.emit('done');
        if (remnant.length) parseHead(stream, state, remnant);
    }
}

function emitHeadEvent(stream, state) {
    stream.emit('head', { 
        opcode: state.opcode, 
        length: state.length,
        // stream can either be a some fragmented frames
        // or a frame above the highWaterMark which is chunked
        stream: !state.fin || state.length > 16 * 1024 - 1
    });
};

function bindToSource(stream, source) {
    stream._source = source;
    stream._source.on('readable', function() {
        stream.read(0);
    });
    stream._source.on('end', function() {
        stream.push(null);
        stream.end();
    });
}
