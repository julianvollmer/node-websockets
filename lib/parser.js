var inherits = require('util').inherits;
var WebSocketFrame = require('./frame');
var TransformStream = require('../node_modules/readable-stream/transform');

function WebSocketParser() {
    TransformStream.call(this);
}

inherits(WebSocketParser, TransformStream);

WebSocketParser.prototype._transform = function(chunk, outputFn, callback) {
    var frame = new WebSocketFrame(chunk);

    var data = frame.getDecodedPayload();

    if (frame.getOpcode() == 0x1) {
        data = data.toString();
    }

    outputFn(data);

    callback();
};

module.exports = WebSocketParser;