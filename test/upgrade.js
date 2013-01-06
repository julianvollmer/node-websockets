var http        = require('http');
var websockets  = require('../lib/index');

var server = http.createServer();

server.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

websockets.server.listen(server);

server.listen(3000);