var url = require('url');
var util = require('util');
var events = require('events');

var WebSocketSocket = require('./socket');

var inherits = util.inherits;
var EventEmitter = events.EventEmitter;

/**
 * WebSocketBase class.
 * 
 * The WebSocketBase class is the parent class of the final class of server
 * and client. If you want to try some own specific implementations inherit
 * from here.
 * 
 * @param   {Object}    options
 * @event   'open'      is emitted on connection
 * @event   ‘close'     is emitted on disconnection        
 * @event   ‘message'   is emitted on incoming message
 * @parent  {EventEmitter} 
 */
function WebSocketBase(options) {
    // defaults
    this.mask = false;
    this.sockets = [];
    this.extensions = [];
    this.counter = 0;
    this.connected = 0;
    this.maxConnections = 10;
    this.url = url.parse('ws://localhost:3000');
    
    // overwrite parameters with options
    if (options && options.mask)
        this.mask = options.mask;
    if (options && options.url)
        this.url = url.parse(options.url);
    
    // we strictly require a path property in url
    this.url.path = (this.url.path || '/');

    // TODO: upcoming options
    //this.strict = options.strict || false;
    //this.maxTimeout = options.maxTimeout || 400;
    //this.maxPayloadSize = options.maxPayloadSize || 20000;
}

// adds event function to class
inherits(WebSocketBase, EventEmitter);

/**
 * Sends some data.
 * 
 * This method sends some data as buffer to the other end of the WebSocket.
 * It returns true if sent and false if queued.
 * 
 * @param   {String/Buffer}    data
 * @return  {Boolean}
 */
WebSocketBase.prototype.send = function(sid, data) {    
    var self = this;

    if (arguments.length == 1) {
        data = sid;
        sid = null;
    }
    
    this._write(sid, 0x01, data);

    return this;
};

/**
 * Sends a ping frame.
 * 
 * This method will send a ping frame through the wire usually the endpoint
 * should send back a pong frame which then should emit a 'pong' event.
 * 
 * @param   {Buffer}    data
 * @event   'pong'  is emitted when pong frame is received
 * @return  {Boolean}
 */
WebSocketBase.prototype.ping = function(sid, data) {
    var self = this;

    if (arguments.length == 1) {
        data = sid;
        sid = null;
    }

    this._write(sid, 0x09, data);

    return this;
};

/**
 * Closes connection of sid.
 * 
 * This method will close the current connection by sending a close frame
 * which contains the reason for disconnection and immediately close the socket.
 * 
 * @param   {Buffer}    reason
 */
WebSocketBase.prototype.close = function(sid, reason) {
    if (arguments.length == 1) {
        sid = null;
        reason = sid;
    }
 
    this._write(sid, 0x08, reason);

    // TODO: remove closed sockets from internal storage

    return this;
};

    

/**
 * Assigns a tcp socket object to the WebSocket.
 * 
 * Because piping streams is only nice when reading data we will bind directly
 * to the events with this method. It should be used at the upgrade process.
 * 
 * @param   {Socket}    socket
 * @param   {Object}    options
 */
WebSocketBase.prototype.assignSocket = function(socket, options) {
    var self = this;
    
    var opts = {};
    if (options && options.extensions) {
        opts.extensions = {};
        options.extensions.forEach(function(name) {
            opts.extensions[name] = self.extensions[name];
        });
    }

    var sid = this.connected;

    socket = new WebSocketSocket(socket, opts);

    socket.on('text', function(message) {
        self.emit('message', message, sid);
    });
    
    socket.on('pong', function(message) {
        self.emit('pong', message, sid);
    });
    
    socket.on('close', function(reason) {
        self.emit('close', reason, sid);
    });
    
    this.sockets.push(socket);
    
    this.connected++;

    this.emit('open', socket);
};

WebSocketBase.prototype._write = function(sid, opcode, data) {
    if (data !== undefined && !Buffer.isBuffer(data))
        data = new Buffer(data);

    if (sid === null) {
        this.sockets.forEach(function(socket) {
            socket.write(opcode, data);
        });
    } else {
        var socket = this.sockets[sid];
        if (socket)
            socket.write(opcode, data);
    }
};

// exports class as module
module.exports = WebSocketBase;
