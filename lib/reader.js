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

    this.emit('data', frame.getEncoded());
};

WebSocketReader.prototype.end = function() {
    this.emit('end');
}

module.exports = WebSocketReader;