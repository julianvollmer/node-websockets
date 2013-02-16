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
function WebSocketClient(options) {
    WebSocketBase.call(this, options);
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
    
    var options = {
        extensions: Object.keys(self.extensions)
    };

    WebSocketUpgrade.createUpgradeRequest(this.url.href, options, function(socket) {
        self.assignSocket(socket);
    });
    
    return this;
};

// exports class as module
module.exports = WebSocketClient;
