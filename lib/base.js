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
    this.options = {};
    this.options.mask = false;
    this.options.extensions = [];

    // defaults
    this.masked = false;
    // stores all sockets
    this.sockets = [];
    // stores all extensions
    this.extensions = [];
 
    // stores parsed url object
    this.url = url.parse('ws://localhost:3000');
    
    // overwrite mask setting
    if (options && options.hasOwnProperty('mask')) {
       this.masked = options.mask;
    }

    // overwrite default url
    if (options && options.hasOwnProperty('url')) {
        this.url = url.parse(options.url);
    }
    
    // bug fix a small incompatibility with url.parse
    if (!this.url.hasOwnProperty('path')) {
        this.url.path = '/';
    }

    // TODO: upcoming options
    //this.strict = options.strict || false;
    //this.masked = options.masked || false;
    //this.extensions = options.extensions || {};
    //this.maxClients = options.maxClients || 100;
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
WebSocketBase.prototype.send = function(data) {    
    var isStr = (typeof data === 'string');
    
    var opcode = (isStr) ? 0x01 : 0x02;
    var payload = (isStr) ? new Buffer(data) : data;
    
    this.sockets.forEach(function(socket) {
        socket.write(opcode, payload);
    });

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
WebSocketBase.prototype.ping = function(data) {
    var isStr = (typeof data === 'string');
    var payload = (isStr) ? new Buffer(data) : data;
    
    this.sockets.forEach(function(socket) {
        socket.write(0x09, payload);
    });

    return this;
};

/**
 * Closes all connection.
 * 
 * This method will close the current connection by sending a close frame
 * which contains the reason for disconnection and immediately close the socket.
 * 
 * @param   {Buffer}    reason
 */
WebSocketBase.prototype.close = function(reason) {
    if (reason && !Buffer.isBuffer(reason))
        reason = new Buffer(reason);
    
    this.sockets.forEach(function(socket) {
        socket.write(0x08, reason);
    });

    return this;
};

WebSocketBase.prototype.setExtensions = function(extens) {
    this.options.extensions = extens;       

    return exists;
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
    if (options.extensions) {
        opts.extensions = {};
        options.extensions.forEach(function(name) {
            opts.extensions[name] = self.extensions[name];
        });
    }

    socket = new WebSocketSocket(socket, opts);

    socket.on('text', function(message) {
        self.emit('message', message, socket);
    });
    
    socket.on('pong', function(message) {
        self.emit('pong', message, socket);
    });
    
    socket.on('close', function(reason) {
        self.emit('close', reason, socket);
    });
    
    this.sockets.push(socket);
    
    this.emit('open', socket);
};

// exports class as module
module.exports = WebSocketBase;
