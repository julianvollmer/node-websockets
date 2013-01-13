var http = require('http');

var WebSocketServer = require('../lib/server');

var httpServer = http.createServer();
var wss = new WebSocketServer('ws://localhost');

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

wss.onopen = function() {
    console.log('connection opened');  

    wss.send('hello');
};

wss.onmessage = function(message) {
    console.log('receiving message: ', message);
    
    wss.send(message);
};

wss.onclose = function() {
    console.log('connection closed');  
};

wss.listen(httpServer);

httpServer.listen(3000);