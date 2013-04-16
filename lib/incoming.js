var util = require('util');
var stream = require('stream');

function WebSocketIncoming(source, options) {
    options = options || {};

    this.fin = true;
    this.rsv1 = false;
    this.rsv2 = false;
    this.rsv3 = false;
    this.mask = false;

    this.opcode = 0x01;
    this.length = 0x00;

    this._index = 0;
    this._headSize = 0;
    this._headBytes = [];
    this._bytesRead = 0;
    this._body = false;
    this._finish = false;

    bindToState(this);
    bindToSource(this, source);

    stream.Readable.call(this, options);
}

util.inherits(WebSocketIncoming, stream.Readable);

WebSocketIncoming.prototype._read = function() {
    var chunk = this._source.read();

    if (chunk === null) {
        if (!this.length) 
            return this.push(null);
        else
            return this.push('');
    }

    var bytesToRead = this.length - this._bytesRead;
    
    if (bytesToRead < chunk.length) {
        this._source.unshift(chunk.slice(bytesToRead));
        
        chunk = chunk.slice(0, bytesToRead);
    }

    this._bytesRead += chunk.length;

    this.push(chunk);

    if (this._bytesRead == chunk.length)
        return this.push(null);
};

module.exports = WebSocketIncoming;

function bindToState(stream) {
    stream.once('end', function() {
        stream.removeAllListeners();
        stream._source.removeAllListeners('readable');
    });
}

function bindToSource(stream, source) {    
    stream._source = source;

    stream._source.on('readable', function() {
        stream.read(0);
    });
}
