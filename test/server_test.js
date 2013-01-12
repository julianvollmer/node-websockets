var http = require('http');

var WebSocketServer = require('../lib/server');

var httpServer = http.createServer();
var webSocketServer = new WebSocketServer('ws://localhost');

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

webSocketServer.onmessage = function(message) {
    console.log(message);
};

httpServer.listen(3000);
webSocketServer.listen(httpServer);