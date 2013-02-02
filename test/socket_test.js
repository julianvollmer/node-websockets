var http = require('http');

var WebSocket = require('../lib/socket');
var WebSocketUpgrade = require('../lib/upgrade');

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

var ws = new WebSocket({ isServer: true });

ws.on('open', function() {
    console.log('connection established');    
});

ws.on('close', function() {
    console.log('connection closed');
});

ws.on('message', function(data) {
    console.log('received data: ', data);
});

httpServer.on('upgrade', function(req, socket, head) {
    WebSocketUpgrade.serverUpgrade(req, socket, head, ws.extensions, function(socket) {
        ws.assignSocket(socket);
    });
});

httpServer.listen(3000);