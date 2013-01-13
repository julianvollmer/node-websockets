var util = require('util');
var stream = require('stream');

var Stream = stream.Stream;
var inherits = util.inherits;

var WebSocketFrame = require('./frame');

function WebSocketReader() {
    this.readable = true;
    this.writable = true;
}

inherits(WebSocketReader, Stream);

WebSocketReader.prototype.write = function(rawFrame) {
    var frame = new WebSocketFrame(rawFrame);

    if (frame.getOpcode() == 0x8) {
        this.emit('close');
        return;
    }
    if (frame.getOpcode() == 0x9) {
        this.emit('ping');
        return;
    }
    if (frame.getOpcode() == 0xA) {
        this.emit('pong');
        return;
    }

    var data = unmask(frame.getMasking(), frame.getPayload());

    if (frame.getOpcode() == 0x1) {
        data = data.toString();
    }

    this.emit('data', data);
};

WebSocketReader.prototype.end = function() {
    this.emit('end');
};

/**
 * Unmasks a payload with a masking key.
 *
 * @param   {Buffer}    masking
 * @param   {Buffer}    payload
 * @param   {Buffer}
 */
function unmask(masking, payload) {
    if (!masking || !payload) return;
    
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++) {
        unmasked[i] = payload[i] ^ masking[i % 4];
    }

    return unmasked;
}

module.exports = WebSocketReader;