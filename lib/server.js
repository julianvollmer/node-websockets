var url = require('url');
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
    options = (options || {});

    options.mask = false;

    WebSocketBase.call(this, options);   
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

    var options = {
        extensions: self.extensions
    };
 
    server.once('upgrade', function(req, socket, head) {
        // if we have a different path then defined in the url skip the event
        if (self.url.path != req.url) return;
        
        WebSocketUpgrade.handleUpgradeRequest(req, socket, options, function(socket, extens) {
            if (extens) {
                extens.forEach(function(exten) {
                    self.enableExtension(exten);
                });
            }
            
            self.assignSocket(socket);
        });
    });
    
    return this;
};

// exports class as module
module.exports = WebSocketServer;
