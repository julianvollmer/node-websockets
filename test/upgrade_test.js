var http     = require('http');
var upgrade  = require('../lib/upgrade');

var server = http.createServer();

server.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

server.on('upgrade', upgrade.serverUpgrade);

server.on('upgrade', function(req, socket) {
    if (!upgrade.isWebSocketUpgrade) return;

    socket.on('data', function(data) {
        console.log(data); 
    });
});

server.listen(3000);