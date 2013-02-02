var util = require('util');

var WebSocket = require('./socket');
var WebSocketUpgrade = require('./upgrade');

/**
 * WebSocketClient.
 * 
 * A WebSocket client implementation.
 */
function WebSocketClient(url, open) {
    var self = this;

    this.url = url;
    
    // TODO: only use one isServer settage
    this.isServer = false;
    
    WebSocket.call(this, { isServer: false });

    if (open) this.open();
}

util.inherits(WebSocketClient, WebSocket);

WebSocketClient.prototype.open = function() {
    var self = this;

    WebSocketUpgrade.clientUpgrade(self.url, self.extensionNames, function(socket, options) {
        console.log('upgrading client: ', options);

        self.enabledExtensions = [].concat(options.extensions);
        self.assignSocket(socket);
    });      
};

module.exports = WebSocketClient;