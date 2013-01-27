var util = require('util');

var WebSocket = require('./socket');
var WebSocketUpgrade = require('./upgrade');

/**
 * WebSocketServer.
 * 
 * @param   {Object}    options
 */
function WebSocketServer(options) {
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

    server.on('upgrade', function(req, socket, head) {
        WebSocketUpgrade.serverUpgrade(req, socket, head, function(socket) {
            self.assignSocket(socket);
        });
    });
    
    return this;
};

module.exports = WebSocketServer;