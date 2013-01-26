var http = require('http');

var WebSocketStream = require('./stream');
var WebSocketUpgrade = require('./upgrade');

/**
 * WebSocketClient.
 * 
 * A WebSocket client implementation.
 */
function WebSocketClient(url) {
    var self = this;
    
    this.stream = new WebSocketStream();
    
    WebSocketUpgrade.clientUpgrade(url, function(socket) {
        self.stream.assignSocket(socket);
        self.onopen();
    });
    
    this.stream.on('data', function(data) {
        self.onmessage(data);
    });
    this.stream.on('close', function() {
       self.onclose(); 
    });
}

/**
 * Send data through the WebSocket connection.
 * 
 * @param   {String}    data
 */
WebSocketClient.prototype.send = function() {};

/**
 * Close the WebSocket connection.
 */
WebSocketClient.prototype.close = function() {};

/**
 * Overwrite this function to do something on connection open.
 */
WebSocketClient.prototype.onopen = function() {};

/**
 * Overwrite this function to do something on connection close.
 */
WebSocketClient.prototype.onclose = function() {};

/**
 * Overwrite this function to do something on incoming messages.
 * 
 * @param   {String}    message
 */
WebSocketClient.prototype.onmessage = function() {};

/**
 * Use this function to bind to a http client.
 * 
 * 
 */
WebSocketClient.prototype.listen = function() {};

module.exports = WebSocketClient;