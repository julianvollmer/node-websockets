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

    bindToSource(this, source);

    stream.Readable.call(this, options);
}

util.inherits(WebSocketIncoming, stream.Readable);

WebSocketIncoming.prototype._read = function() {
    // because we directly push data into the queue
    // there is no need for a read function
};

module.exports = WebSocketIncoming;

function bindToSource(request, source) {
    request._source = source;
}
