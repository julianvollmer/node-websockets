var util = require('util');
var stream = require('stream');

function WebSocketStream(socket, options) {
    options || (options = {});

    var self = this;
 
    // reset frame markers
    resetFrameMarkers(this);

    // bind to socket
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

WebSocketStream.prototype._read = function() {
    var chunk = this.socket.read();

    if (chunk === null)
        return this.push('');

    if (this.isHead) {
        this.isHead = false;

        parseFrameHead(this, chunk);

        chunk = chunk.slice(this.offset);
    }  
    
    if (chunk.length > 0) {
        this.parsed += chunk.length;

        if (chunk) {
            this.push(mask(this.index, this.masking, chunk));
            this.index += chunk.length - 1;
        }
    }
};

module.exports = WebSocketStream;

function parseFrameHead(stream, chunk) {
    stream.fin = !!(chunk[0] & 0x80);
    stream.rsv1 = !!(chunk[0] & 0x40);
    stream.rsv2 = !!(chunk[0] & 0x20);
    stream.rsv3 = !!(chunk[0] & 0x10);
    stream.mask = !!(chunk[1] & 0x80);
    
    var offset = 0x02;
    var length = chunk[1] & 0x7f;

    switch (length) {
        case 126:
            length = chunk.readUInt16BE(offset);
            offset += 2;
            break;
        case 127:
            length = chunk.readUInt32BE(offset + 4);
            offset += 8;
            break;
    }

    var masking;
    if (stream.mask) {
        masking = chunk.slice(offset, offset + 4);
        offset += 4;
    } else {
        masking = new Buffer(0);
    }

    stream.offset = offset;
    stream.length = length;
    stream.masking = masking;
}

function resetFrameMarkers(stream) {
    stream.isHead = true;
    
    stream.fin = true;
    stream.rsv1 = false;
    stream.rsv2 = false;
    stream.rsv3 = false;
    stream.mask = false;
   
    stream.index = 0;
    stream.parsed = 0;

    stream.masking = null;
    stream.payload = null;
}

function mask(index, masking, payload) {
    var length = payload.length;
    var unmasked = new Buffer(length);

    for (var i = 0; i < length; i++)
        unmasked[i] = payload[i] ^ masking[(index + i) % 4];

    return unmasked;
}
