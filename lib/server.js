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
}

WebSocketServer.prototype.onopen = function() {};

WebSocketServer.prototype.onclose = function() {};

WebSocketServer.prototype.onmessage = function() {};

WebSocketServer.prototype.listen = function(server) {
    var self = this;

    server.on('upgrade', function(req, socket) {
        Upgrade.serverUpgrade(req, socket, function(socket) {
            self.onopen();

            socket.on('data', function(data) {
                socket.pipe(self.reader);
            });

            socket.on('close', self.onclose);
        });
    });
}

module.exports = WebSocketServer;