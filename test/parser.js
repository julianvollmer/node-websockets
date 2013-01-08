var http    = require('http');

var Index   = require('../lib/index');
var Reader  = require('../lib/reader');
var Writer  = require('../lib/writer');
var Upgrade = require('../lib/upgrade');

var httpServer = http.createServer();
var webSocketServer = Index.server;

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

var reader = new Reader();

reader.on('data', function(data) {
    console.log(data.toString());
});

webSocketServer.on('upgraded', function(socket, head) {
    socket.pipe(reader);
});

webSocketServer.listen(httpServer);

httpServer.listen(3000);