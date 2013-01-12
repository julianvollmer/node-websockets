var http    = require('http');

var Upgrade = require('../lib/upgrade');
var ReadFrame = require('../lib/read_frame');
var WriteFrame = require('../lib/write_frame');

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

httpServer.on('upgrade', function(req, socket) {
    Upgrade(req, socket);

    socket.on('data', function(rawFrame) {
        var frame = new ReadFrame(rawFrame);

        console.log('raw :'. rawFrame);
        console.log('final: ', frame.isFinal());
        console.log('masked: ', frame.isMasked());
        console.log('opcode: ', frame.getOpcode());
        console.log('length: ', frame.getLength());
        console.log('masking: ', frame.getMasking());
        console.log('payload: ', frame.getPayload());
        console.log('encoded: ', frame.getEncodedPayload());
    });

    setTimeout(function() {
        var writeFrame = new WriteFrame();

        writeFrame.setFinal(true);
        writeFrame.setOpcode(0x1);
        writeFrame.setPayload(new Buffer('hi'));

        socket.write(writeFrame.toBuffer());
    }, 500);
    
});

httpServer.listen(3000);