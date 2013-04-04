var util = require('util');
var stream = require('stream');

function WebSocketRequest(source, options) {

    this.opcode = null;
    this.stream = null;
    this.ended = false;

    bindToSource(this, source);

    stream.Readable.call(this, options);
}

util.inherits(WebSocketRequest, stream.Readable);

WebSocketRequest.prototype._read = function() {
    var chunk = this._source.read();

    if (chunk === null)
        return this.push('');

    this.push(chunk);
};

module.exports = WebSocketRequest;

function bindToSource(stream, source) {
    stream._source = source;

    function readable() {
        stream.read(0);
    }
    function done() {
        stream.removeListener('readable', readable);
        stream.push(null);
    }

    stream.source.on('readable', readable);
    stream.source.once('done', done);
}
