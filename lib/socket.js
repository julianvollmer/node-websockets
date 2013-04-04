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
    bindToControlHandling(this, options);

    stream.Duplex.call(this, options);
}

WebSocket.prototype.writeHead = function(options) {
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

    frameBytes.push(parser.writeHeadBytes(state));
    frameBytes.push(parser.writeBodyBytes(state, chunk));

    // NOTE: doing write async can break frame order
    this._source.write(Buffer.concat(frameBytes));

    done(null);
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

        if (state.opcode != 0x00)
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
    var body = parser.readBodyBytes(state, chunk);

    stream.push(body);

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
    
    this.opcode = 0x01;
    
    if (options.mask)
        this.mask = options.mask;
    if (options.opcode)
        this._opcode = options.opcode;
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

function bindToControlHandling(stream) {
    stream.on('head', function(state) {
        if (!state.opcode) return;
            
        switch (state.opcode) {
            case 0x08:
                handleCloseFrame(stream);
                break;
            case 0x09:
                handlePingFrame(stream);
                break;
            case 0x0a:
                handlePongFrame(stream);
                break;
        }
    });
}

function handleCloseFrame(stream) {
    stream.once('readable', function() {
        var body = stream.read();
        var code = body.readUInt16BE(0);

        stream.end();
        stream.push(null);
        stream.emit('close', code, body);
    });
}

function handlePingFrame(stream) {
    stream.once('readable', function() {
        stream.writeHead({ fin: true, opcode: 0x0a });
        stream.write(stream.read());
    });
}

function handlePongFrame(stream) {
    stream.once('readable', function() {
        stream.emit('pong', stream.read());
    });
}
