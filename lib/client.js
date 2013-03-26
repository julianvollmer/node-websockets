var util = require('util');

var WebSocketBase = require('./base');
var WebSocketUpgrade = require('./upgrade');

function WebSocketClient(options) {
    options = (options || {});

    options.mask = true;
    options.maxConnections = 1;

    WebSocketBase.call(this, options);
}

util.inherits(WebSocketClient, WebSocketBase);

WebSocketClient.prototype.open = function(wsurl) {
    var self = this;

    var url = (wsurl || this.url.href);

    var options = { 
        extensions: Object.keys(self.extensions) 
    };

    WebSocketUpgrade.createUpgradeRequest(url, options, function(err, socket, options) {
        if (err) self.emit('error', 'upgrade', err);

        options.mask = true;

        self.assignSocket(socket, options);
    });
    
    return this;
};

WebSocketClient.prototype.send = function() {
    var socket = this.sockets[0];

    return socket.send.apply(socket, arguments);
};

WebSocketClient.prototype.ping = function() {
    var socket = this.sockets[0];

    return socket.ping.apply(socket, arguments);
};

WebSocketClient.prototype.close = function() {
    var socket = this.sockets[0];

    return socket.close.apply(socket, arguments);
};

module.exports = WebSocketClient;
