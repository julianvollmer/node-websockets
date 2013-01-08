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

httpServer.on('upgrade', function(req, socket) {
    var writer = new Writer(socket);

    Upgrade(req, socket);

    socket.pipe(reader);

    setTimeout(function() {
        var writer = new Writer(socket);

        writer.write('hello world');

        /*var head = new Buffer(2);
        var data = new Buffer('hello world');

        head[0] = 0x81;
        head[1] = 0x01 | data.length;

        frame = Buffer.concat([head, data]);

        socket.write(frame);*/
    }, 500);
    
});

httpServer.listen(3000);