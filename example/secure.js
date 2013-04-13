var fs = require('fs');
var util = require('util');
var path = require('path');
var https = require('https');
var websockets = require('../lib');

var httpServer = new https.Server({
    key: fs.readFileSync(path.join(__dirname + '/keys/key.pem')),
    cert: fs.readFileSync(path.join(__dirname + '/keys/cert.pem'))
});

httpServer.on('request', function(request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write('Hello World\n');
    response.end();
});

var wsServer = new websockets.Server({
    "url": "ws://localhost:3000",
    "timeout": 0
});

wsServer.on('open', function(wsSocket) {
    wsSocket.send('Welcome to our session');
    wsServer.broadcast(util.format('WebSocket #%d has connected', wsSocket.id));
});

wsServer.on('message', function(message, wsSocket) {
    wsServer.broadcast(util.format('WebSocket #%d says: %s', wsSocket.id, message));
});

wsServer.listen(httpServer);

httpServer.listen(3000);
