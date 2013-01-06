var http = require('http');
var websockets = require('../lib/index');

var webSocketServer = websockets.server;

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

webSocketServer.on('upgraded', function(socket, head) {
    socket.on('data', function(data) {
        console.log(data);
    }); 
});

webSocketServer.listen(httpServer);

httpServer.listen(3000);