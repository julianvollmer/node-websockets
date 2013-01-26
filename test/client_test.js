var http = require('http');

var WebSocketServer = require('../lib/server');
var WebSocketClient = require('../lib/client');

var wss = new WebSocketServer('ws://localhost:3000').listen(http.createServer().listen(3000));

wss.onopen = function() {
    wss.send('hello I am the server');
};

wss.onmessage = function(data) {
    console.log('server received: ', data);
};

setTimeout(function() {
    var wsc = new WebSocketClient('ws://localhost:3000');

    wsc.onopen = function() {
        wsc.send('hello I am the client');
    };

    wsc.onmessage = function(message) {
        console.log('client received: ', message);
    };
    
    wsc.send('one');
    wsc.send('two');
    wsc.send('three');
}, 600);