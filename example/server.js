var http = require('http');
var websockets = require('../lib');

var httpServer = new http.createServer();
var websocketServer = new websockets.Server();

httpServer.on('request', function(req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end('Hello World\n');
});

websocketServer.on('open', function(sid) {
    websocketServer.send('new client has connected');
    websocketServer.send(sid, 'hello');
});

websocketServer.on('close', function(reason, sid) {
    websocketServer.send(sid + ' has left');
});

websocketServer.on('message', function(message, sid) {
    websocketServer.send('received message ' + message);
    websocketServer.send(sid, 'have got yor mess');
});

websocketServer.listen(httpServer);

httpServer.listen(3000);
