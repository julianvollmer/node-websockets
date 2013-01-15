var http    = require('http');

var WebSocketParser = require('../lib/parser');
var WebSocketUpgrade = require('../lib/upgrade');

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

var parser = new WebSocketParser();

parser.on('data', function(data) {
    console.log(data);
});

httpServer.on('upgrade', function(req, socket) {
    WebSocketUpgrade.serverUpgrade(req, socket, function(socket) {
        socket.pipe(parser);

        //parser.write('hello');
    });
});

httpServer.listen(3000);