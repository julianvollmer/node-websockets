var http = require('http');

var WebSocketServer = require('../lib/server');
var WebSocketClient = require('../lib/client');

var server = http.createServer();

var wss = new WebSocketServer('ws://localhost:3000').listen(server);

wss.on('open', function() {
    wss.send('hello I am the server');
});

wss.on('message', function(data) {
    console.log('server received: ', data);
    wss.send('got your message client.');
});

setTimeout(function() {
    var wsc = new WebSocketClient('ws://localhost:3000');

    wsc.on('open', function() {
        wsc.send('hello I am the client');
    });

    wsc.on('message', function(message) {
        console.log('client received: ', message);
    });
}, 600);

server.listen(process.env.PORT || 3000);