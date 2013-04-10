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
    this._written = 0;

    bindToStats(this, source);

    stream.Writable.call(this, options);
}

util.inherits(WebSocketOutgoing, stream.Writable);

WebSocketOutgoing.prototype._write = function(chunk, encoding, done) {
    if (!this._wroteHead) {
        writeHead(this, this._source);

        this._wroteHead = true;
    }

    if (this._written + chunk.length > this.length)
        return done(new Error('Cannot exceed payload length defined in head.'));

    if (chunk && chunk.length) {
        this._source.write(chunk);
        this._written += chunk.length;
    }

    done(null);
};

module.exports = WebSocketOutgoing;

function bindToStats(outgoing, source) {
    outgoing.once('finish', function() {
        if (!this._wroteHead)
            writeHead(outgoing, source);
    });
}

function writeHead(outgoing, source) {
    source.writeHead({
        fin: outgoing.fin,
        rsv1: outgoing.rsv1,
        rsv2: outgoing.rsv2,
        rsv3: outgoing.rsv3,
        mask: outgoing.mask,
        length: outgoing.length,
        opcode: outgoing.opcode
    });
}
