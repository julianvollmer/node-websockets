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

    bindToSource(this, source);

    stream.Readable.call(this, options);
}

util.inherits(WebSocketIncoming, stream.Readable);

WebSocketIncoming.prototype._read = function() {
    var chunk = this._source.read();

    // if we have an no payload we will need this check
    // on the first readable (which will be a null read)
    // so we must copy this even it is not smart...
    if (!this.length)
        return this.push(null);

    if (chunk === null)
        return this.push('');

    var bytesToRead = this.length - this._bytesRead;
    
    chunk = chunk.slice(0, bytesToRead);

    this._bytesRead += chunk.length;

    this.push(chunk);

    if (this._bytesRead == chunk.length) {
        return this.push(null);
    }
};

module.exports = WebSocketIncoming;

function bindToSource(stream, source) {   
    stream._source = source;

    stream._source.on('readable', function() {
        stream.read(0);
    });
}
