var WebSocketStream = require('./stream');

/**
 * Base class of the WebSocket implementation.
 * 
 * @param   {Object}    options
 */
function WebSocket(options) {
    var self = this;
    
    this.isServer = (options.isServer || !options.isClient);
    
    this.stream = new WebSocketStream(options);
    this.stream.on('open', function() { self.onopen(); });
    this.stream.on('data', function(data) { self.onmessage(data); });
    this.stream.on('close', function() { self.onclose(); });
}

/**
 * Sends some string data to the other end of the socket.
 * 
 * @param   {String}    data
 * @return  {Boolean}
 */
WebSocket.prototype.send = function(data) {
    var options = {};
    
    if (typeof data == 'string') {
        data = new Buffer(data);
    }
    
    options.masked = !this.isServer;
    options.opcode = 0x1;
    options.data = data;
    
    this.stream.custom(options);
    
    return true;
};

/**
 * Closes current socket connection.
 * 
 * @return  {WebSocket}
 */
WebSocket.prototype.close = function() {
    this.stream.end();
    
    return this;
};

/**
 * Is executed when connection is established.
 */
WebSocket.prototype.onopen = function() {};

/**
 * Is executed when connection is closed.
 */
WebSocket.prototype.onclose = function() {};

/**
 * Is executed when message is received.
 */
WebSocket.prototype.onmessage = function() {};

/**
 * Is executed when receiving a ping frame.
 */
WebSocket.prototype._ping = function() {
    this._pong();
};

/**
 * Sends a pong frame.
 */
WebSocket.prototype._pong = function() {
    this.stream.custom({
        masked: false,
        opcode: 0xA,
        length: 0,
        data: null
    });
};

/**
 * Binds this WebSocket to a standing socket connection.
 * 
 * @param   {Socket}    socket
 * @return  {WebSocket}
 */
WebSocket.prototype.assignSocket = function(socket) {
    this.stream.assignSocket(socket);
    
    return this;
};

module.exports = WebSocket;