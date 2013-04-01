var url = require('url');
var util = require('util');

var WebSocketBase = require('./base');
var WebSocketUpgrade = require('./upgrade');

util.inherits(WebSocketServer, WebSocketBase);

function WebSocketServer(options) {
    options = (options || {});

    options.mask = false;

    WebSocketBase.call(this, options);   
}

WebSocketServer.prototype.listen = function(server) {
    var self = this;
 
    server.on('upgrade', function(req, socket, head) {
        // the upgrade event will be emitted on all upgrades, so we have to check
        // if url equals with the one set in out server. Because you cannot check
        if (!matchesRoute(self.url, req.url)) return;

        WebSocketUpgrade.handleUpgradeRequest(req, socket, function(err, socket, options) {
            if (err) self.emit('error', 'upgrade', err);
            
            self.assignSocket(socket, options);
        });
    });
    
    return this;
};

WebSocketServer.prototype.broadcast = function(head, chunk) {
    var self = this;

    if (arguments.length == 1) {
        chunk = head;
    }
    
    this.sockets.forEach(function(socket) {
        socket.writeHead(head);
        socket.writeEnd(chunk);
    });

    return this;
};

function matchesRoute(source, url) {
    if (source.path === null && url === '/')
        return true;

    if (source.path === url)
        return true;

    return false;
}

module.exports = WebSocketServer;
