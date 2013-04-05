var url = require('url');
var util = require('util');
var events = require('events');

var WebSocket = require('./socket');
var WebSocketUpgrade = require('./upgrade');
var handleUpgradeRequest = WebSocketUpgrade.handleUpgradeRequest;

util.inherits(WebSocketServer, events.EventEmitter);

function WebSocketServer(options) {
    options = (options || {});

    // defaults
    this.mask = false;
    this.sockets = [];
    this.timeout = 600 * 1000;
    this.connections = 0;
    this.maxConnections = 10;
    
    this.url = url.parse('ws://localhost');
    
    // overwrite parameters with options
    if (options.url)
        this.url = url.parse(options.url);
    if (options.timeout)
        this.timeout = options.timeout;
    if (options.maxConnections)
        this.maxConnections = options.maxConnections;
}

WebSocketServer.prototype.broadcast = function(message) {
    var self = this;
    
    this.sockets.forEach(function(socket) {
        socket.send(message);
    });

    return this;
};

WebSocketServer.prototype.listen = function(server) {
    var self = this;
 
    server.on('upgrade', function(req, socket, head) {
        // the upgrade event will be emitted on all upgrades, so we have to check
        // if url equals with the one set in out server. Because you cannot check
        if (!matchesRoute(self.url, req.url)) return;

        handleUpgradeRequest(req, socket, function(err, options) {
            if (err) self.emit('error', err);
            
            self.assignSocket(socket, options);
        });
    });
    
    return this;
};

WebSocketServer.prototype.assignSocket = function(socket, options) {
    var options = { mask: this.mask };

    if (this.timeout)
        socket.setTimeout(this.timeout);

    var wssocket = new WebSocket(socket, options);

    bindToWebSocket(this, wssocket);

    for (var i = 0; this.sockets.length > this.maxConnections; i++)
        this.sockets[i].close('Maximum amount of connections reached.');

    this.emit('open', wssocket);
};

function bindToWebSocket(server, wssocket) {
    wssocket.id = server.sockets.push(wssocket) - 1;
    
    wssocket.on('pong', function(message) {
        server.emit('pong', message, wssocket);
    });

    wssocket.on('close', function(message) {
        server.sockets.splice(wssocket.id, 1);
        server.emit('close', message, wssocket);
    });

    wssocket.on('message', function(message) {
        server.emit('message', message, wssocket);
    });

    wssocket.on('stream', function(chunk) {
        server.emit('stream', chunk, wssocket);
    });
}

function matchesRoute(source, url) {
    if (source.path === null && url === '/')
        return true;

    if (source.path === url)
        return true;

    return false;
}

module.exports = WebSocketServer;
