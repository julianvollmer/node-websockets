var http = require('http');
var websockets = require('../lib');

var httpServer = new http.createServer();
var websocketServer = new websockets.Server();
var websocketClient = new websockets.Client();

httpServer.on('request', function(req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end('Hello World\n');
});

websocketServer.on('open', function(sid) {
    websocketServer.send('new client has connected');
    websocketServer.send(sid, 'hello');
});

websocketServer.on('message', function(message, sid) {
    websocketServer.send('received message ' + message);
    websocketServer.send(sid, 'have got yor mess');
});

websocketServer.listen(httpServer);

httpServer.listen(3000);

websocketClient.on('open', function(message) {
    websocketClient.send('hello here is the client');
});

websocketClient.on('message', function(message) {
    console.log('client gets:', message);
});

websocketClient.open('ws://localhost:3000');
