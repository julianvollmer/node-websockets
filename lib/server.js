var util = require('util');

var WebSocket = require('./socket');
var WebSocketUpgrade = require('./upgrade');

/**
 * WebSocketServer.
 * 
 * @param   {Object}    options
 */
function WebSocketServer(options) {
    // TODO: test if I can miss one of these statements:
    WebSocket.call(this, { isServer: true });
    
    this.isServer = true;
}

util.inherits(WebSocketServer, WebSocket);

/**
 * Binds the WebSocket to a http server instance.
 * 
 * @param   {Server}    server
 * @return  {WebSocketServer}
 */
WebSocketServer.prototype.listen = function(server) {
    var self = this;
    var extensions = this.extensions;

    server.on('upgrade', function(req, socket, head) {
        WebSocketUpgrade.serverUpgrade(req, socket, head, extensions, function(socket) {
            self.assignSocket(socket);
        });
    });
    
    return this;
};

module.exports = WebSocketServer;