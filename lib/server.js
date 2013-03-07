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
        // the upgrade event will be emitted on all upgrades, so we have to check
        // if url equals with the one set in out server. Because you cannot check
        // req.url with a url.parse object we have to check if there is no path and if there is one
        if (!((self.url.path === undefined && req.url == '/') || (self.url.path === req.url)))
            return;

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
