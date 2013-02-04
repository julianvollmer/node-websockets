var util = require('util');

var WebSocketBase = require('./base');
var WebSocketUpgrade = require('./upgrade');

/**
 * WebSocketServer class.
 * 
 * The WebSocketServer class acts in cooperation with an instance of a http 
 * server as server endpoint for websockets.
 *
 * @param   {Object}    options
 * @event   'open'      is emitted on connection
 * @event   ‘close'     is emitted on disconnection        
 * @event   ‘message'   is emitted on incoming message
 * @parent  {WebSocketBase} 
 */
function WebSocketServer(options) {
    
}

// inherits methods from WebSocketBase
util.inherits(WebSocketServer, WebSocketBase);

/**
 * Binds WebSocketServer to http server instance.
 * 
 * @param   {Server}    server
 * @return  {WebSocketServer}
 */
WebSocketServer.prototype.listen = function(server) {
    var self = this;
    
    server.on('upgrade', function(req, socket, head) {
        WebSocketUpgrade.handleUpgradeRequest(req, socket, function() {
            self.assignSocket(socket);
        });
    });
    
    return this;
};

// exports class as module
module.exports = WebSocketServer;