var url = require('url');
var util = require('util');
var events = require('events');

var WebSocket = require('./socket');
var WebSocketUpgrade = require('./upgrade');

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

WebSocketServer.prototype.broadcast = function(head, chunk) {
    var self = this;
    
    this.sockets.forEach(function(socket) {
        socket.writeHead(head);
        socket.write(chunk);
    });

    return this;
};

WebSocketServer.prototype.listen = function(server) {
    var self = this;
 
    server.on('upgrade', function(req, socket, head) {
        // the upgrade event will be emitted on all upgrades, so we have to check
        // if url equals with the one set in out server. Because you cannot check
        if (!matchesRoute(self.url, req.url)) return;

        WebSocketUpgrade.handleUpgradeRequest(req, socket, function(err, socket, options) {
            if (err) self.emit('error', err);
            
            self.assignSocket(socket, options);
        });
    });
    
    return this;
};

WebSocketServer.prototype.assignSocket = function(socket, options) {
    var self = this;
    
    var options = { 
        mask: self.mask, 
    };

    if (this.timeout)
        socket.setTimeout(this.timeout);

    var wssocket = new WebSocket(socket, options);

    wssocket.id = this.sockets.push(wssocket) - 1;

    wssocket.on('head', function(state) {
        if (state.opcode < 0x03) {
            wssocket.on('readable', bindToMessage);
        } else {
            wssocket.removeListener('readable', bindToMessage);
        }
    });
    
    wssocket.on('pong', function(message) {
        self.emit('pong', message, wssocket);
    });

    wssocket.on('done', function() {
        self.emit('done', wssocket);
    });

    function bindToMessage() {
        var chunk = wssocket.read();

        if (chunk)
            self.emit('message', chunk, wssocket);
    }

    wssocket.on('close', function(code) {
        self.sockets.splice(wssocket.id, 1);
        self.emit('close', code, wssocket);
    });

    for (var i = 0; this.sockets.length > this.maxConnections; i++)
        this.sockets[i].close('Maximum amount of connections reached.');

    this.emit('open', wssocket);
};

function matchesRoute(source, url) {
    if (source.path === null && url === '/')
        return true;

    if (source.path === url)
        return true;

    return false;
}

module.exports = WebSocketServer;
