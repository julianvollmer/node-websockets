var util = require('util');
var stream = require('stream');

var WebSocketFrame = require('./frame');

var Stream = stream.Stream;
var inherits = util.inherits;

/**
 * WebSocketStream.
 */
function WebSocketStream() {
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
WebSocketStream.prototype.send = function(data) {
    var frame = new WebSocketFrame();

    frame.setFinal(true);
    frame.setOpcode(0x2);

    if (typeof data == 'string') {
        frame.setOpcode(0x1);
        data = new Buffer(data);
    }

    frame.setPayload(data);

    this.socket.write(frame.toBuffer());
};

/**
 * Gets executed when data is received.
 *
 * @param   {Buffer}    rawFrame
 */
WebSocketStream.prototype.write = function(rawFrame) {
    var frame = new WebSocketFrame(rawFrame);

    if ([0x0, 0x1, 0x2].indexOf(frame.getOpcode()) != -1) {
        var data = frame.getDecodedPayload();

        if (frame.getOpcode() == 0x1) {
            data = data.toString();
        }        

        this.emit('data', data);

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

WebSocketStream.prototype.ping = function() {
    var frame = new WebSocketFrame();

    frame.setFinal(true);
    frame.setOpcode(0xA);

    frame.setLength(0);
    frame.setPayload('');  

    this.socket.write(frame.toBuffer());

    this.emit('ping');
};

WebSocketStream.prototype.pong = function() {
    console.log('received a pong');  

    this.emit('pong');
};

WebSocketStream.prototype.end = function() {
    this.socket.end();

    this.emit('close');  
};

WebSocketStream.prototype.assignSocket = function(socket) {
    socket.pipe(this);

    this.socket = socket;

    return this;
};

module.exports = WebSocketStream;