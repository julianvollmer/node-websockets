var util = require('util');
var stream = require('stream');
var crypto = require('crypto');

var WebSocketFrame = require('./frame');

var Stream = stream.Stream;
var inherits = util.inherits;

/**
 * WebSocketStream.
 * 
 * The WebSocketStream class is en- and decoding all incoming
 * and outgoing data to the right format. Furthermore it handles
 * specific control frames.
 */
function WebSocketStream() {
    this.open = false;

    this.readable = true;
    this.writable = true;
}

// TODOS:
// - allow setting headers of frame object similar to ClientRequest in http module

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

    if ([0x0, 0x1, 0x2].indexOf(frame.getOpcode()) != -1) {
        var payload = frame.getDecodedPayload();

        if (frame.getOpcode() == 0x1) {
            payload = payload.toString();
        }        

        this.emit('data', payload);

        return;
    }

    switch (frame.getOpcode()) {
        case 0x8:
            this.end();
            break;
        case 0x9:
            this.ping();
            break;
        case 0xA:
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
    
    if (options.client) {
        frame.setMasking(crypto.randomBytes(4));   
    }
    
    frame.setDecodedPayload(data);
    
    this.socket.write(frame.toBuffer());
};

/**
 * Sends a ping WebSocket frame through the connection.
 */
WebSocketStream.prototype.ping = function() {
    var frame = new WebSocketFrame();

    frame.setFinal(true);
    frame.setOpcode(0xA);

    frame.setLength(0);
    frame.setPayload('');  

    this.socket.write(frame.toBuffer());

    this.emit('ping');
};

/**
 * Sends a pong WebSocket frame through the connection.
 */
WebSocketStream.prototype.pong = function() {
    console.log('received a pong');  

    this.emit('pong');
};

/**
 * Is executed on end event.
 * 
 * @event
 */
WebSocketStream.prototype.end = function() {
    this.socket.end();

    this.emit('close');  
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