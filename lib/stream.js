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
    this.open = false;

    this.readable = true;
    this.writable = true;
}

inherits(WebSocketStream, Stream);

/**
 * Send some data through the WebSocket.
 *
 * @param   {Mixed}     data
 */
WebSocketStream.prototype.send = function(data, options) {
    this._transformOutput(data, options);
};

/**
 * Gets executed when data is received.
 *
 * @param   {Buffer}    rawFrame
 */
WebSocketStream.prototype.write = function(rawFrame) {
    this._transformInput(rawFrame);
};

/**
 * Transforms incoming WebSocket frame to JavaScript object
 * 
 * @event
 * @param   {Buffer}    data
 */
WebSocketStream.prototype._transformInput = function(data) {
    var frame = new WebSocketFrame(data);

    switch (frame.getOpcode()) {
        case 0x1:
            this.emit('data', frame.getData().toString());
            break;
        case 0x2:
            this.emit('data', frame.getData());
            break;
        case 0x8:
            this.emit('close', frame);
            this.end();
            break;
        case 0x9:
            this.emit('ping', frame);
            this.ping();
            break;
        case 0xA:
            this.emit('pong', frame);
            this.pong();
            break;
        default:
            this.emit('error', 'reserved opcode');
            break;
    }  
};

/**
 * Transforms outgoing JavaScript object to WebSocket frame.
 * 
 * @param   {Buffer}    data
 */
WebSocketStream.prototype._transformOutput = function(data, options) {
    var frame = new WebSocketFrame();
    
    options = options || { client: false };
    
    frame.setFinal(true);
    
    if (options.client) {
        frame.setMasked(true);
    }
    
    frame.setOpcode(0x2);
    
    if (typeof data == 'string') {
        frame.setOpcode(0x1);
        data = new Buffer(data);
    }
    
    frame.setData(data);
    
    this.socket.write(frame.toBuffer());
};

/**
 * Sends a ping WebSocket frame through the connection.
 */
WebSocketStream.prototype.ping = function() {
    var frame = new WebSocketFrame();

    frame.setFinal(true);
    frame.setMasked(false);
    frame.setOpcode(0xA);
    frame.setLength(0);
    frame.setData(null);  

    this.socket.write(frame.toBuffer());
};

/**
 * Sends a pong WebSocket frame through the connection.
 */
WebSocketStream.prototype.pong = function() {
    console.log('received a pong');  
};

/**
 * Is executed on end event.
 * 
 * @event
 */
WebSocketStream.prototype.end = function() {
    this.socket.end();  
};

/**
 * Assigns a socket connection to the WebSocketStream
 */
WebSocketStream.prototype.assignSocket = function(socket) {
    socket.pipe(this);

    this.socket = socket;

    return this;
};

module.exports = WebSocketStream;