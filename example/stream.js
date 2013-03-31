var http = require('http');

var WebSocketStream = require('../lib/stream');
var WebSocketUpgrade = require('../lib/upgrade');

var server = http.createServer();

server.on('request', function(request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end('Hello World\n');
});

server.on('upgrade', function(request, socket) {
    WebSocketUpgrade.handleUpgradeRequest(request, socket, function(err, socket) {
        var wsstream = new WebSocketStream(socket);

        wsstream.on('readable', function() {
            console.log(wsstream.read().toString());
        });
    });
});

server.listen(3000);
