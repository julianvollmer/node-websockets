var util = require('util');
var stream = require('stream');

function WebSocketResponse(source, options) {

    this.opcode = null;

    bindToSource(this, source);

    stream.Writable.call(this, options);
}

util.inherits(WebSocketResponse, stream.Writable);

WebSocketResponse.prototype._write = function(chunk, encoding, done) {

    this._source.write(chunk);

    done(null);
};

module.exports = WebSocketResponse;

function bindToSource(stream, source) {
    stream._source = source;
}
