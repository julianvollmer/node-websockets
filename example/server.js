var http = require('http');
var websockets = require('../lib');

var httpServer = http.createServer();
var wsserver = new websockets.Server();

httpServer.on('request', function(req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end('Hello World\n');
});

wsserver.on('open', function(wssocket) {
    wssocket.writeEnd(new Buffer('Hello new Socket.'));
    wsserver.broadcast(new Buffer('Let us greet the new Socket.'));
});

wsserver.on('message', function(chunk, wssocket) {
    console.log(chunk.toString());
});

wsserver.listen(httpServer);

httpServer.listen(3000);
