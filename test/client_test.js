var http = require('http');

var WebSocketServer = require('../lib/server');
var WebSocketClient = require('../lib/client');

var server = http.createServer();

var wss = new WebSocketServer('ws://localhost:3000').listen(server);

wss.onopen = function() {
    wss.send('hello I am the server');
};

wss.onmessage = function(data) {
    console.log('server received: ', data);
    wss.send('got your message client.');
};

setTimeout(function() {
    var wsc = new WebSocketClient('ws://localhost:3000');

    wsc.onopen = function() {
        wsc.send('hello I am the client');
    };

    wsc.onmessage = function(message) {
        console.log('client received: ', message);
    };
}, 600);

server.listen(3000);