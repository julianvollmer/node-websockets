var util = require('util');
var stream = require('stream');

var WebSocketFrame = require('./frame');

var Stream = stream.Stream;
var inherits = util.inherits;

/**
 * WebSocketInputStream.
 * 
 * Tranforms incoming WebSocket frames to buffer format.
 */
function WebSocketInputStream() {
    this.readable = true;
}

inherits(WebSocketInputStream, Stream);

/**
 * Writes raw frame into stream.
 * 
 * @event
 * @param   {Buffer}    data
 */
WebSocketInputStream.prototype.write = function(data) {
    var frame = new WebSocketFrame(data);
    
    this.emit('data', frame.getDecodedPayload());
};

module.exports = WebSocketInputStream;