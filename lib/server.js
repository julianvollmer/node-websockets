var Reader = require('./reader');
var Writer = require('./writer');
var Upgrade = require('./upgrade');

function WebSocketServer(url) {
    var self = this;

    this.url = url;

    this.reader = new Reader();
    // this adds onmessage multiple time as listener...
    this.reader.on('data', function(data) {
        self.onmessage(data);
    });
    this.reader.on('close', function() {
        self.writer.socket.end();
    });
    this.reader.on('ping', function() {
        self.writer.ping();
    });
    this.reader.on('pong', function() {
        self.writer.pong(); 
    });
}

WebSocketServer.prototype.send = function(data) {
    // queue op instead of returning false
    if (!this.writer) return false;

    this.writer.write(data);

    return true;
};

WebSocketServer.prototype.onopen = function() {};

WebSocketServer.prototype.onclose = function() {};

WebSocketServer.prototype.onmessage = function() {};

WebSocketServer.prototype.listen = function(server) {
    var self = this;

    server.on('upgrade', function(req, socket) {
        Upgrade.serverUpgrade(req, socket, function(socket) {
            self.writer = new Writer(socket);
            
            self.onopen();

            socket.pipe(self.reader);

            socket.on('close', self.onclose);
        });
    });
}

module.exports = WebSocketServer;