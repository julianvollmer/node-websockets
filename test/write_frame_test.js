var http    = require('http');

var Upgrade = require('../lib/upgrade');
var WriteFrame = require('../lib/write_frame');

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

httpServer.on('upgrade', function(req, socket) {
    Upgrade(req, socket);

    setTimeout(function() {
        var writeFrame = new WriteFrame();

        writeFrame.setFinal(true);
        writeFrame.setOpcode(0x1);
        writeFrame.setPayload(new Buffer('hi'));

        console.log(writeFrame.toBuffer().toString('hex'));

        socket.write(writeFrame.toBuffer());
    }, 500);
    
});

httpServer.listen(3000);