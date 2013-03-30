var util = require('util');
var stream = require('stream');

function WebSocketStream(socket, options) {
    options || (options = {});

    var self = this;
    
    this.fin = true;
    this.rsv1 = false;
    this.rsv2 = false;
    this.rsv3 = false;
    this.mask = false;
    this.body = false;

    this.masking = null;
    this.payload = null;

    this.socket = socket;

    this.socket.on('readable', function() {
        self.read(0);
    });
    this.socket.on('end', function() {
        self.push(null);
    });

    stream.Duplex.call(this, options);
}

util.inherits(WebSocketStream, stream.Duplex);

WebSocketStream.prototype._read = function(size) {
    var chunk = this.socket.read();

    if (chunk === null)
        return this.push('');

    this.fin = Boolean(chunk[0] & 0x80);
    this.rsv1 = Boolean(chunk[0] & 0x40);
    this.rsv2 = Boolean(chunk[0] & 0x20);
    this.rsv3 = Boolean(chunk[0] & 0x10);
    this.mask = Boolean(chunk[1] & 0x80);
    
    this.length = chunk[1] & 0x7f;

    this.masking = chunk.slice(2, 6);
    this.payload = chunk.slice(6, this.length);

    this.push(mask(this.masking, this.payload));
};

module.exports = WebSocketStream;

function mask(masking, payload) {
    var length = payload.length;
    var unmasked = new Buffer(length);

    for (var i = 0; i < length; i++)
        unmasked[i] = payload[i] ^ masking[i % 4];

    return unmasked;
}
