var util = require('util');

var WebSocket = require('./socket');
var WebSocketUpgrade = require('./upgrade');

/**
 * WebSocketClient.
 * 
 * A WebSocket client implementation.
 */
function WebSocketClient(url) {
    var self = this;
    
    // TODO: only use one isServer settage
    this.isServer = false;
    
    WebSocket.call(this, { isServer: false });
    WebSocketUpgrade.clientUpgrade(url, function(socket) {
        self.assignSocket(socket);
    });
}

util.inherits(WebSocketClient, WebSocket);

module.exports = WebSocketClient;