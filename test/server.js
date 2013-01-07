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
        frame.setOpcode(0xA);
        console.log(frame.headers[0]);
    }); 
});

webSocketServer.listen(httpServer);

httpServer.listen(3000);