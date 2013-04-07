var util = require('util');
var stream = require('stream');

function WebSocketRequest(source, options) {
    options = options || {};

    this.fin = true;
    this.rsv1 = false;
    this.rsv2 = false;
    this.rsv3 = false;
    this.mask = false;

    this.opcode = 0x01;
    this.length = 0x00;

    bindToSource(this, source);

    stream.Readable.call(this, options);
}

util.inherits(WebSocketRequest, stream.Readable);

WebSocketRequest.prototype._read = function() {
    var chunk = this._source.read();

    if (chunk === null)
        return this.push('');

    return this.push(chunk);
};

module.exports = WebSocketRequest;

function bindToSource(request, source) {
    request._source = source;
}
