var inherits = require('util').inherits;
var WebSocketFrame = require('./frame');
var TransformStream = require('../node_modules/readable-stream/transform');

function WebSocketParser() {
    TransformStream.call(this);
}

inherits(WebSocketParser, TransformStream);

WebSocketParser.prototype._transform = function(chunk, outputFn, callback) {
    var frame = new WebSocketFrame(chunk);

    if (frame.getOpcode() == 0x1) {
        var data = unmask(frame.getMasking(), frame.getPayload()).toString();
    }
    if (frame.getOpcode() == 0x2) {
        var data = unmask(frame.getMasking(), frame.getPayload());
    }

    if (!data) return;

    outputFn(data);

    callback();
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

module.exports = WebSocketParser;