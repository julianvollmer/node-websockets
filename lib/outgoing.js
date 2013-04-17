var util = require('util');
var stream = require('stream');

function WebSocketOutgoing(source, options) {
    options = options || {};

    this.fin = false;
    this.rsv1 = false;
    this.rsv2 = false;
    this.rsv3 = false;
    this.mask = false;

    this.opcode = 0x02;
    this.length = 0x00;

    this._source = source;

    this._wroteHead = false;
    this._writtenBytes = 0;
    this._written = 0;
    this._finish = false;

    bindToStats(this, source);

    stream.Writable.call(this, options);
}

util.inherits(WebSocketOutgoing, stream.Writable);

WebSocketOutgoing.prototype._write = function(chunk, encoding, done) {
    if (this._written + chunk.length > this.length)
        return done(new Error('Cannot exceed payload length defined in head.'));

    this._source.write(chunk);

    done(null);
};

module.exports = WebSocketOutgoing;

function bindToStats(outgoing, source) {
    outgoing.once('finish', function() {
        if (!this._wroteHead)
            this._source.write(new Buffer(0));
    });
}
