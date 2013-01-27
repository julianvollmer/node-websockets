var util = require('util');
var stream = require('stream');

var WebSocketFrame = require('./frame');

var Stream = stream.Stream;
var inherits = util.inherits;

/**
 * WebSocketStream.
 * 
 * The WebSocketStream class is en- and decoding all incoming
 * and outgoing data to the right format. Furthermore it handles
 * specific control frames.
 * 
 * TODOs:
 * - api for sending custom frames
 * - options (client, server, etc.)
 */
function WebSocketStream(options) {
    options = options || {};
    
    this.open = false;
    this.readable = true;
    this.writable = true;
}

inherits(WebSocketStream, Stream);

/**
 * Send a custom WebSocket frame back the wire.
 * 
 * @param   {Object}    options
 */
WebSocketStream.prototype.custom = function(options) {
    var frame = new WebSocketFrame();
    
    frame.setFinal(true);
    frame.setMasked(options.masked || false);
    frame.setOpcode(options.opcode || 0x1);
    frame.setLength(options.length || 0);
    frame.setData(options.data || null);
    
    this.socket.write(frame.toBuffer());
};

/**
 * Gets executed when data is received.
 *
 * @param   {Buffer}    frame
 */
WebSocketStream.prototype.write = function(frame) {
    this._transform(frame);
};

/**
 * Transforms incoming WebSocket frames to data events.
 * 
 * @event
 * @param   {Buffer}    data
 */
WebSocketStream.prototype._transform = function(data) {
    var frame = new WebSocketFrame(data);

    switch (frame.getOpcode()) {
        case 0x1:
            this.emit('data', frame.getData().toString());
            break;
        case 0x2:
            this.emit('data', frame.getData());
            break;
        case 0x8:
            this.end();
            this.emit('close', frame);
            break;
        case 0x9:
            this.emit('ping', frame);
            break;
        case 0xA:
            this.emit('pong', frame);
            break;
        default:
            this.emit('error', 'reserved opcode');
            break;
    }  
};

/**
 * Closes the socket connection.
 * 
 * @return  {WebSocketStream}
 */
WebSocketStream.prototype.end = function() {
    this.socket.end();  
    
    return this;
};

/**
 * Assigns a socket connection to the WebSocketStream
 * 
 * @event
 * @param   {Socket}    socket
 */
WebSocketStream.prototype.assignSocket = function(socket) {
    this.socket = socket;
    this.socket.pipe(this);
    
    this.emit('open');

    return this;
};

module.exports = WebSocketStream;