var util = require('util');
var stream = require('stream');
var crypto = require('crypto');
var parser = require('./parser');

var WebSocketIncoming = require('./incoming');
var WebSocketOutgoing = require('./outgoing');

util.inherits(WebSocketCore, stream.Duplex);

var emptyBuffer = new Buffer(0);

function WebSocketCore(source, options) {
    options = options || { opcode: 0x01 };

    var self = this;

    this.request = null;
    this.response = null;

    this.useRequest = false;
    this.useResponse = false;

    if (options.useRequest)
        this.useRequest = !!options.useRequest;

    this._frameReadState = new FrameReadState(options);
    this._frameWriteState = new FrameWriteState(options);

    bindToSource(this, source, options);

    stream.Duplex.call(this, options);
}

function FrameReadState(options) {
    this.body = false;
    
    this.index = 0;
    this.headSize = 0;
    this.headBytes = [];
}

function FrameWriteState(options) {
    this.mask = false;
    this.opcode = 0x01;
    this.written = 0x00;
    this.wroteHead = false;
    
    if (options.mask)
        this.mask = options.mask;
    if (options.opcode)
        this._opcode = options.opcode;
}

WebSocketCore.prototype.writeHead = function(options) {
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
    
    state.length = options.length;
    state.wroteHead = true;

    this._source.write(parser.writeHeadBytes(state));

    return this;
};

WebSocketCore.prototype._read = function() {
    var chunk = this._source.read();
    var state = this._frameReadState;

    if (chunk === null)
        return this.push('');

    if (!state.body)
        parseHead(this, state, chunk);
    else
        parseBody(this, state, chunk);
};

WebSocketCore.prototype._write = function(chunk, encoding, done) {
    var state = this._frameWriteState;

    if (!state.wroteHead) 
        done(new Error('Have to write head before writting payload.'));;

    if (state.written + chunk.length > state.length)
        done(new Error('Payload exceeds defined length in head.'));

    // NOTE: doing write async can break frame order
    this._source.write(parser.writeBodyBytes(state, chunk));

    state.written += chunk.length;
    
    // TODO: this is open for errors in some cases because we copy all chunk
    // even this can be more than allowed
    if (state.written == state.length) {
        state.written = 0;
        state.wroteHead = false;
    }

    done(null);
};

module.exports = WebSocketCore;

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
        emitRequest(stream, state);

        // if our chunk is bigger than the headSize it is
        // properly some body chunk so we call parseBody on it
        if (headBuffer.length >= headSize) {
            state.body = true;
            state.headSize = 0;
            state.headBytes = [];
            parseBody(stream, state, chunk.slice(headSize));
        }
    }

    // push empty string to 
    // keep on reading
    stream.push('');
}

function parseBody(stream, state, chunk) {
    var body = parser.readBodyBytes(state, chunk);
    var remnant = chunk.slice(state.length);

    // push to readque
    if (stream.useRequest) {
        stream.request.push(body);
        stream.push('');
    } else {
        stream.push(body);
    }

    // if our index counter equals the length we have 
    // parsed all body bytes and maybe have new frame
    if (state.length == state.index) {
        state.body = false;
        state.index = 0;
        endRequest(stream);
        if (remnant.length) parseHead(stream, state, remnant);
    }
}

function emitRequest(stream, state) {
    // stream can either be a some fragmented frames
    // or a frame above the highWaterMark which is chunked
    state.stream = !state.fin || state.length > 500;

    if (!stream.useRequest)
        return stream.emit('request', state);

    var request = new WebSocketIncoming(stream);

    request.fin = state.fin;
    request.rsv1 = state.rsv1;
    request.rsv2 = state.rsv2;
    request.rsv3 = state.rsv3;
    request.mask = state.mask;
    request.stream = state.stream;
    request.opcode = state.opcode;
    request.length = state.length;

    stream.request = request;
    stream.emit('request', request);
}

function endRequest(stream, request) {
    if (!stream.useRequest)
        return stream.emit('done');

    stream.request.push(null);
}

function bindToSource(stream, source) {
    stream._source = source;
    stream._source.on('readable', function() {
        stream.read(0);
    });
    // TODO: we should call end() and push(null)
    // on stream but this will fuck up end events...
    stream._source.on('end', function() {
        stream.emit('end');
    });
}
