var http = require('http');
var websockets = require('../lib');

var httpServer = new http.createServer();
var websocketServer = new websockets.Server();

httpServer.on('request', function(req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end('Hello World\n');
});

websocketServer.on('open', function() {
    websocketServer.send('hello');
});

websocketServer.on('message', function(message) {
    console.log(message);
});

websocketServer.listen(httpServer);

httpServer.listen(3000);
