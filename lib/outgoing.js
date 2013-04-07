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

    this._first = true;

    this._source = source;
    
    this.once('finish', function() {
        if (this.fin) return;
        this.fin = true;
        this.write(new Buffer(0));
    });

    stream.Writable.call(this, source);
}

util.inherits(WebSocketOutgoing, stream.Writable);

WebSocketOutgoing.prototype._write = function(chunk, encoding, done) {
    var opcode = (this._first) ? this.opcode : 0x00;
    
    this._source.writeHead({
        fin: this.fin,
        rsv1: this.rsv1,
        rsv2: this.rsv2,
        rsv3: this.rsv3,
        mask: this.mask,
        opcode: opcode
    });
    this._source.write(chunk);

    this._first = false;

    done(null);
};

module.exports = WebSocketOutgoing;
