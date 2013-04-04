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

    bindToSource(this, source, options);

    stream.Duplex.call(this, options);
}

WebSocket.prototype.setOpcode = function(opcode) {
    var state = this._frameWriteState;
    
    if (!state.fin && opcode < 3)
        state._opcode = opcode;

    return this;
};

WebSocket.prototype._read = function() {
    var chunk = this._source.read();
    var state = this._frameReadState;

    if (chunk === null)
        return this.push('');

    if (!state.body)
        parseHead(this, state, chunk);
    else
        parseBody(this, state, chunk);
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

function parseHead(stream, state, chunk) {
    var headSize = state.headSize;
    var headBytes = state.headBytes;
    
    var s = headBytes.length;
    for (var i = 0; i < chunk.length; i++)
        headBytes[s + i] = chunk[i];

    var headBuffer = new Buffer(headBytes);

    if (!headSize && headBuffer.length > 1) {
        headSize = parser.calcHeadSize(headBuffer);
        state.headSize = headSize;
    }
    if (headSize && headBuffer.length >= headSize) {
        parser.readHeadBytes(state, headBuffer);
        
        if (state.fin)
            stream.emit('head', state.toEvent());
       
        state.body = true;
        state.headSize = 0;
        state.headBytes = [];

        if (headBuffer.length > headSize) {
            parseBody(stream, state, chunk.slice(headSize));
        }
    }

    stream.push('');
}

function parseBody(stream, state, chunk) {
    stream.push(parser.readBodyBytes(state, chunk));

    if (!state.body) {
        if (state.fin) {
            stream.emit('done');
        }
        
        var remnant = chunk.slice(state.length);
        if (remnant.length)
            parseHead(stream, state, remnant);
    }
}

function FrameReadState(options) {
    options = options || {};

    this.body = false;

    this.index = 0;
 
    this.headSize = 0;
    this.headBytes = [];
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

function bindToSource(stream, source, options) {
    stream._source = source;

    stream._source.on('readable', function() {
        stream.read(0);
    });

    stream._source.on('end', function() {
        stream.push(null);
    });
}
