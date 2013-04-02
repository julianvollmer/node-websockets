var util = require('util');
var stream = require('stream');
var crypto = require('crypto');
var parser = require('./parser');

util.inherits(WebSocket, stream.Duplex);

function WebSocket(source, options) {
    options = options || {};

    var self = this;

    this.opcode = 0x01;

    this._source = source;
    this._source.on('readable', function() {
        self.read(0);
    });
    this._source.on('end', function() {
        self.push(null);
    });

    this._frameReadState = new FrameReadState(options);
    this._frameWriteState = new FrameWriteState(options);

    if (options.opcode && options.opcode < 3)
        this.opcode = options.opcode;

    stream.Duplex.call(this, options);
}

WebSocket.prototype._read = function() {
    var chunk = this._source.read();
    var state = this._frameReadState;
    
    // push something to keep reading but return
    if (chunk === null)
        return this.push('');
};

WebSocket.prototype._write = function(chunk, encoding, done) {
    var state = this._frameWriteState;
    
    state.length = chunk.length;

    if (state.first) {
        state.fin = false;
        state.opcode = this.opcode;
    } else {
        state.opcode = 0x00;
    }

    if (state.last) 
        state.fin = true;

    var frameBytes = [];
    frameBytes.push(parser.writeHeadBytes(state));
    frameBytes.push(parser.writeBodyBytes(state, chunk));


    if (state.first) {
        state.first = false;
    }

    if (state.last) {
        state.first = true;
        state.last = false;
    }

    this._source.write(Buffer.concat(frameBytes), function() {
        done(null);
    });
};

WebSocket.prototype.writeEnd = function(chunk) {
    var state = this._frameWriteState;

    state.last = true;

    if (!chunk)
        chunk = new Buffer(0);

    return this.write(chunk);
};

function FrameReadState(options) {
    options = options || {};

    this.body = false;

    this.parsed = 0;
    this.missing = 0;

    this.headSize = 0;
    this.headBytes = [];
}

function FrameWriteState(options) {
    options = options || {};

    this.mask = false;
    this.first = true;
    
    this.opcode = 0x01;
    
    if (options.mask)
        this.mask = options.mask;
    if (options.opcode)
        this.opcode = options.opcode;
}

module.exports = WebSocket;
