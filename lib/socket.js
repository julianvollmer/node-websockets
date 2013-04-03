var util = require('util');
var stream = require('stream');
var crypto = require('crypto');
var parser = require('./parser');

util.inherits(WebSocket, stream.Duplex);

var emptyBuffer = new Buffer(0);

function WebSocket(source, options) {
    options = options || { opcode: 0x01 };

    var self = this;

    this._frameReadState = new FrameReadState(options);
    this._frameWriteState = new FrameWriteState(options);

    bindToSource(this, source);

    stream.Duplex.call(this, options);
}

WebSocket.prototype._read = function() {
    var chunk = this._source.read();
    var state = this._frameReadState;

    if (chunk === null)
        return this.push('');

    readChunk(this, state, chunk);
};

WebSocket.prototype._write = function(chunk, encoding, done) {
    var frameBytes = [];
    var state = this._frameWriteState;
    
    if (!chunk)
        chunk = emptyBuffer;

    state.length = chunk.length;

    setFrameFlags(state);
    frameBytes.push(parser.writeHeadBytes(state));
    frameBytes.push(parser.writeBodyBytes(state, chunk));
    resetFrameFlags(state);

    // NOTE: doing write async can break frame order
    this._source.write(Buffer.concat(frameBytes));

    done(null);
};

WebSocket.prototype.writeEnd = function(chunk) {
    var state = this._frameWriteState;

    state.last = true;

    if (!chunk)
        chunk = emptyBuffer;

    return this.write(chunk);
};

module.exports = WebSocket;

function readChunk(stream, state, chunk) {
    if (state.cache.length) {
        var cache = state.cache.concat(chunk || emptyBuffer);
        chunk = Buffer.concat(cache);
        state.cache = [];
    }

    if (!state.body) {
        var headBytes = state.headBytes;
        
        var s = state.headBytes.length;
        for (var i = 0; i < chunk.length; i++) {
            state.headBytes[s + i] = chunk[i];
        }
        
        var headBuffer = new Buffer(headBytes);

        if (headBuffer.length > 1) {
            state.headSize = parser.calcHeadSize(headBuffer);
        }

        if (headBuffer.length >= state.headSize && state.headSize) {
            parser.readHeadBytes(state, headBuffer);
            stream.emit('head', state.toEvent());
            state.cache.push(chunk.slice(state.headSize));
            state.resetHead();
            state.body = true;
            readChunk(stream, state);
        }
        
        stream.push('');
    } else {
        var body = chunk.slice(0, state.length);

        stream.push(body);
        state.parsed += body.length;

        if (state.parsed >= state.length) {
            state.parsed = 0;
            state.body = false;
            state.cache.push(chunk.slice(state.length));
            readChunk(stream, state);
        }
    }
}

function FrameReadState(options) {
    options = options || {};

    this.body = false;

    this.parsed = 0;
    this.missing = 0;
 
    this.headSize = 0;
    this.headBytes = [];

    this.cache = [];
}

FrameReadState.prototype.resetHead = function() {
    this.headSize = 0;
    this.headBytes = [];
};

FrameReadState.prototype.toEvent = function() {
    return { stream: !this.fin, opcode: this.opcode };
};

function FrameWriteState(options) {
    options = options || {};

    this.mask = false;
    this.first = true;
    
    this.opcode = 0x01;
    
    if (options.mask)
        this.mask = options.mask;
    if (options.opcode)
        this._opcode = options.opcode;
}

function setFrameFlags(state) {
    if (state.first) {
        state.fin = false;
        state.opcode = state._opcode;
    } else {
        state.opcode = 0x00;
    }

    if (state.last) 
        state.fin = true;
}

function resetFrameFlags(state) {
    if (state.first) {
        state.first = false;
    }

    if (state.last) {
        state.first = true;
        state.last = false;
    }
}

function bindToSource(stream, source) {
    stream._source = source;

    stream._source.on('readable', function() {
        stream.read(0);
    });

    stream._source.on('end', function() {
        stream.push(null);
    });
}
