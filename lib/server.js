var url = require('url');
var util = require('util');

var inherits = util.inherits;

var WebSocketBase = require('./base');
var WebSocketUpgrade = require('./upgrade');

function WebSocketServer(options) {
    options = (options || {});

    options.mask = false;

    WebSocketBase.call(this, options);   
}

inherits(WebSocketServer, WebSocketBase);

WebSocketServer.prototype.listen = function(server) {
    var self = this;
 
    server.on('upgrade', function(req, socket, head) {
        // if we have a different path then defined in the url skip the event
        if (self.url.path != req.url) return;
        
        var options = { extensions: Object.keys(self.extensions) };

        WebSocketUpgrade.handleUpgradeRequest(req, socket, options, function(err, socket, options) {
            if (err)
                self.emit('error', 'upgrade', err);
            
            self.assignSocket(socket, options);
        });
    });
    
    return this;
};

module.exports = WebSocketServer;
