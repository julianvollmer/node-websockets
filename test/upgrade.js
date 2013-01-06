var http     = require('http');
var upgrade  = require('../lib/upgrade');

var server = http.createServer();

server.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

server.on('upgrade', upgrade);

server.listen(3000);