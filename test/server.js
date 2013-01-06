var http = require('http');
var websockets = require('../lib/index');

var Frame = websockets.Frame;
var webSocketServer = websockets.server;

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

webSocketServer.on('upgraded', function(socket, head) {
    socket.on('data', function(buff) {
        var frame = new Frame(buff);
        console.log(frame.getOpcode());
    }); 
});

webSocketServer.listen(httpServer);

httpServer.listen(3000);