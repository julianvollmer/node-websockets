var http = require('http');

var WebSocketUpgrade = require('../lib/upgrade');
var WebSocketInputStream = require('../lib/input');

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    console.log('handling request', req.headers);
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

var inputStream = new WebSocketInputStream();

inputStream.on('data', function(data) {
    console.log(data.toString());
});

httpServer.on('upgrade', function(req, socket) {
    console.log('upgrading protocol', req);
    
    WebSocketUpgrade.serverUpgrade(req, socket, function(socket) {
        socket.pipe(inputStream);
    });
});

httpServer.listen(process.env.PORT, function() {
    console.log('listening on port '+ process.env.PORT);
});