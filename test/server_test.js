var http = require('http');

var WebSocketServer = require('../lib/server');

var httpServer = http.createServer();
var wss = new WebSocketServer('ws://localhost');

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

wss.on('open', function() {
    console.log('connection opened');  

    wss.send('hello');
});

wss.on('message', function(message) {
    console.log('receiving message: ', message);
    
    wss.send(message);
});

wss.on('close', function() {
    console.log('connection closed');  
});

wss.listen(httpServer);

httpServer.listen(process.env.PORT || 3000);