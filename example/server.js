var http = require('http');
var websockets = require('../lib');

var httpServer = new http.createServer();
var websocketServer = new websockets.Server();

websocketServer.on('open', function() {
    websocketServer.send('Hello Client.');
});

websocketServer.on('message', function(message) {
    console.log(message);
});

websocketServer.listen(httpServer);

httpServer.listen(3000);