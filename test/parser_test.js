var http    = require('http');

var Reader  = require('../lib/reader');
var Writer  = require('../lib/writer');
var Upgrade = require('../lib/upgrade');


var reader = new Reader();

reader.on('data', function(data) {
    console.log(data.toString());
});

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

httpServer.on('upgrade', Upgrade.serverUpgrade);

httpServer.on('upgrade', function(req, socket) {
    if (!Upgrade.isWebSocketUpgrade) return;

    var writer = new Writer(socket);

    socket.pipe(reader);

    setTimeout(function() {
        var writer = new Writer(socket);

        writer.write('hello world');
    }, 500);
    
});

httpServer.listen(3000);