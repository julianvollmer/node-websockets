var http = require('http');

var WebSocket = require('../lib/new_socket');
var WebSocketUpgrade = require('../lib/upgrade');

var server = http.createServer();

server.on('request', function(request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end('Hello World\n');
});

server.on('upgrade', function(request, socket) {
    WebSocketUpgrade.handleUpgradeRequest(request, socket, function(err, socket) {
        var ws = new WebSocket(socket);
        ws.on('data', function(frame) {
            console.log('data', frame);
        });
        ws.send(new Buffer([0x6f, 0x6f]));
    });
});

server.listen(3000);
