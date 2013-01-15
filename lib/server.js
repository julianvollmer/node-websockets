var Upgrade = require('./upgrade');
var WebSocketStream = require('./stream');

function WebSocketServer() {
    var self = this;

    this.stream = new WebSocketStream();

    this.stream.on('data', function(data) {
        self.onmessage(data);
    });
    this.stream.on('close', function() {
        self.onclose();
    });
}

WebSocketServer.prototype.onopen = function() {};
WebSocketServer.prototype.onclose = function() {};
WebSocketServer.prototype.onmessage = function() {};


WebSocketServer.prototype.send = function(data) {
    this.stream.send(data);

    return true;
};

WebSocketServer.prototype.close = function() {
    this.stream.end();

    return true;
};

WebSocketServer.prototype.listen = function(server) {
    var self = this;

    server.on('upgrade', function(req, socket) {
        Upgrade.serverUpgrade(req, socket, function(socket) {
            self.stream.assignSocket(socket);
            
            self.onopen(self.stream);

            socket.pipe(self.stream);
        });
    });
}

module.exports = WebSocketServer;