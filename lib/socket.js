var net = require('net');
var util = require('util');
var events = require('events');

var WebSocketFrame = require('./frame');

var Socket = net.Socket;
var inherits = util.inherits;
var EventEmitter = events.EventEmitter;

function WebSocketSocket(socket) {
    this.mask = false;
    this.socket = null;  
 
    if (socket instanceof Socket)
        this.assign(socket);
}

inherits(WebSocketSocket, EventEmitter);

WebSocketSocket.prototype.write = function(opcode, content) {
    if (opcode instanceof Buffer) {
        content = opcode;
        opcode = 0x01;
    }

    if (!content)
        content = new Buffer(0);

   
    if (typeof opcode != 'number')
        throw new Error('opcode should be a number');
    if (content instanceof Buffer)
        throw new Error('content should be a buffer');

    var wsf = new WebSocketFrame();
    wsf.fin = true;
    wsf.mask = this.mask;
    wsf.opcode = opcode;
    wsf.length = content.length;
    wsf.content = content;

    if (wsf.isValid())
        this.socket.write(wsf.toBuffer());
};

WebSocketSocket.prototype.close = function(reason) {
    if (arguments.length == 0)
        reason = '';
    if (typeof reason != 'string')
        throw new Error('reason needs to be a string');

    this.write(0x08, new Buffer(reason));
    this.socket.end();
};

WebSocketSocket.prototype.assign = function(socket) {
    if (!socket instanceof Socket)
        throw new Error('socket must be an instance of net.Socket');

    var self = this;

    this.socket = socket;

    this.socket.on('data', function(frame) {
        // encode frame    
    });
    this.socket.on('end', function() {
        self.emit('close');
    });
 
    return this;
};

module.exports = WebSocketSocket;
