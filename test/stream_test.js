var http = require('http');

var WebSocketStream = require('../lib/stream');
var WebSocketUpgrade = require('../lib/upgrade');

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

var stream = new WebSocketStream();

stream.on('data', function(data) {
    console.log(data);
});

httpServer.on('upgrade', function(req, socket, head) {
    WebSocketUpgrade.serverUpgrade(req, socket, head, function(socket) {
        stream.assignSocket(socket);
    });
});

httpServer.listen(3000);