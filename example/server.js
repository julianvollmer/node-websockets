var http = require('http');
var websockets = require('../lib');

var httpServer = new http.createServer();
var wsserver = new websockets.Server();

httpServer.on('request', function(req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end('Hello World\n');
});

wsserver.on('open', function(wssocket) {
    wssocket.send('Hello new Socket.');
    wsserver.broadcast('Let us greet the new Socket.');
});

wsserver.on('close', function(reason, wssocket) {
    wsserver.broadcast(wssocket.index + ' has left us.');
});

wsserver.on('message', function(message, wssocket) {
    wssocket.send('Have received your message:' + message);
    wsserver.broadcast(wssocket.index + ' has sent ' + message);
});

wsserver.listen(httpServer);

httpServer.listen(3000);
