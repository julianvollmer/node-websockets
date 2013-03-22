var http = require('http');
var websockets = require('../lib');

var httpServer = new http.createServer();
var wsserver = new websockets.Server();
var wsclient = new websockets.Client();

httpServer.on('request', function(req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end('Hello World\n');
});

wsserver.on('open', function(wssocket) {
    wssocket.send('Hello you are #' + wssocket.index);
    wsserver.broadcast('New client has connected.');
});

wsserver.on('message', function(message, wssocket) {
    wssocket.send('You have sent me:' + message);
    wsserver.broadcast('Client #' + wssocket.index + ' has sent: ' + message);
});

wsserver.listen(httpServer);

httpServer.listen(3000);

wsclient.on('open', function(wssocket) {
    wsclient.send('Hello here is a client.');
    // or
    wssocket.send('Hello here is a client.');
});

wsclient.on('message', function(message, wssocket) {
    console.log('Incoming message:', message);
});

wsclient.open('ws://localhost:3000');
