var url = require('url');
var util = require('util');
var events = require('events');

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
    
    // direct url fragments
    this.protocol = options.protocol || 'ws:';
    this.hostname = options.hostname || 'localhost:3000';
    this.host = options.host || 'localhost';
    this.port = options.port || '3000';
    this.path = options.path || '/';
    this.query = options.query || '?foo=bar';
    
    // or url encoded
    this.url = options.url || 'ws://localhost:3000';
    
    // webosocket options
    this.strict = options.strict || false;
    this.masked = options.masked || false;
    this.extensions = options.extensions || {};
    this.maxClients = options.maxClients || 100;
    this.maxTimeout = options.maxTimeout || 400;
    this.maxPayloadSize = options.maxPayloadSize || 20000;
    
}

// adds event function to class
util.inherits(WebSocketBase, events.EventEmitter);

/**
 * Sends some data.
 * 
 * This method sends some data as buffer to the other end of the WebSocket.
 * It returns true if sent and false if queued.
 * 
 * @param   {Buffer}    data
 * @return  {Boolean}
 */
WebSocketBase.prototype.send = function(data) {
    
};

/**
 * Closes the connection.
 * 
 * This method will close the current connection by sending a close frame
 * which contains the reason for disconnection and immediately close the socket.
 * 
 * @param   {Buffer}    reason
 */
WebSocketBase.prototype.close = function(reason) {
    
};

/**
 * Checks if extension is registered.
 * 
 * This method allows to control if a extension has been added.
 * 
 * @param   {String}    name
 * @param   {Boolean}
 */
WebSocketBase.prototype.hasExtension = function(name) {
    
};

/**
 * Adds an extension to the websocket.
 * 
 * This method will add an extension to the internal extension collection
 * wrapped in a object to keep state like enabled and so on.
 * 
 * @param   {String}    name
 * @param   {Function}  extension
 */
WebSocketBase.prototype.addExtension = function(name, extension) {
    
};

/**
 * Removes an extension from the websocket.
 * 
 * This method will remove an extension from the internal extension collection
 * but only if this is not in use else it will return false.
 * 
 * @param   {String}    name
 * @return  {Boolean}
 */
WebSocketBase.prototype.removeExtension = function(name) {
    
};

// exports class as module
module.exports = WebSocketBase;