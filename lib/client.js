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
    options = (options || {});

    options.mask = true;
    options.maxConnections = 1;

    WebSocketBase.call(this, options);
}

// inherits methods from WebSocketBase
util.inherits(WebSocketClient, WebSocketBase);

/**
 * Opens a connection the WebSocketServer.
 * 
 * @return  {WebSocketClient}
 */
WebSocketClient.prototype.open = function(wsurl) {
    var self = this;

    var url = (wsurl || this.url.href);

    var options = { 
        extensions: Object.keys(self.extensions) 
    };

    WebSocketUpgrade.createUpgradeRequest(url, options, function(socket, options) {
        self.assignSocket(socket, options);
    });
    
    return this;
};

// exports class as module
module.exports = WebSocketClient;
