var url = require('url');
var util = require('util');
var events = require('events');

var WebSocket = require('./socket');

util.inherits(WebSocketBase, events.EventEmitter);

function WebSocketBase(options) {
    options = (options || {});

    // defaults
    this.mask = false;
    this.sockets = [];
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

WebSocketBase.prototype.assignSocket = function(socket, options) {
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

module.exports = WebSocketBase;
