var util = require('util');

var WebSocketBase = require('./base');
var WebSocketUpgrade = require('./upgrade');

/**
 * WebSocketClient class.
 * 
 * The WebSocketClient class can be used to connect to a WebSocketServer.
 *
 * @param   {Object}    options
 * @event   'open'      is emitted on connection
 * @event   ‘close'     is emitted on disconnection        
 * @event   ‘message'   is emitted on incoming message
 * @parent  {WebSocketBase} 
 */
function WebSocketClient(url, options) {
    this.url = url;
}

// inherits methods from WebSocketBase
util.inherits(WebSocketClient, WebSocketBase);

/**
 * Opens a connection the WebSocketServer.
 * 
 * @return  {WebSocketClient}
 */
WebSocketClient.prototype.open = function() {
    var self = this;
    
    WebSocketUpgrade.createUpgradeRequest(this.url, function(socket) {
        self.assignSocket(socket);
    });
    
    return this;
};

// exports class as module
module.exports = WebSocketClient;