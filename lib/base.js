var url = require('url');
var util = require('util');
var events = require('events');

var WebSocketSocket = require('./socket');

function WebSocketBase(options) {
    options = (options || {});

    // defaults
    this.mask = false;
    this.sockets = [];
    this.extensions = {};
    this.timeout = 600 * 1000;
    this.connections = 0;
    this.maxConnections = 10;
    
    this.url = url.parse('ws://localhost');
    
    // overwrite parameters with options
    if (options.mask)
        this.mask = options.mask;
    if (options.url)
        this.url = url.parse(options.url);
    if (options.timeout)
        this.timeout = options.timeout;
    if (options.maxConnections)
        this.maxConnections = options.maxConnections;
}

util.inherits(WebSocketBase, events.EventEmitter);

WebSocketBase.prototype.assignSocket = function(socket, options) {
    var self = this;
    
    var opts = { 
        mask: self.mask, 
        timeout: self.timeout 
    };

    if (options && options.extensions) {
        opts.extensions = {};
        options.extensions.forEach(function(name) {
            opts.extensions[name] = self.extensions[name];
        });
    }

    socket = new WebSocketSocket(socket, opts);

    socket.on('pong', function(message) {
        self.emit('pong', message, socket);
    });
    
    socket.on('close', function(reason) {
        self.sockets.splice(socket.index, 1);
        self.emit('close', reason, socket);
    });

    socket.on('message', function(message) {
        self.emit('message', message, socket);
    });
 
    socket.on('custom', function(event) {
        self.emit.apply(self, arguments);
    });

    //for (var i = 0; this.socketsHistory.length > this.maxConnections; i++)
    //    this.close(this.socketsHistory[i], 'maxConnections reached.');

    socket.index = this.sockets.push(socket) - 1;

    this.emit('open', socket);
};

module.exports = WebSocketBase;
