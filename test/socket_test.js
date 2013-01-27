var http = require('http');

var WebSocket = require('../lib/stream');
var WebSocketUpgrade = require('../lib/upgrade');

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

var ws = new WebSocket({ isServer: true });

ws.onopen = function() {
    console.log('connection established');    
};

ws.onclose = function() {
    console.log('connection closed');
};

ws.onmessage = function(data) {
    console.log('received data: ', data);
};

httpServer.on('upgrade', function(req, socket, head) {
    WebSocketUpgrade.serverUpgrade(req, socket, head, function(socket) {
        ws.assignSocket(socket);
    });
});

httpServer.listen(3000);