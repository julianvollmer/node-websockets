var http    = require('http');

var Upgrade = require('../lib/upgrade');
var WebSocketFrame = require('../lib/frame');

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

httpServer.on('upgrade', function(req, socket) {
    Upgrade(req, socket);

    socket.on('data', function(raw) {
        var frame = new WebSocketFrame(raw);

        console.log('raw :', raw);
        console.log('final: ', frame.isFinal());
        console.log('masked: ', frame.isMasked());
        console.log('opcode: ', frame.getOpcode());
        console.log('length: ', frame.getLength());
        console.log('masking: ', frame.getMasking());
        console.log('payload: ', frame.getPayload());
        console.log('encoded: ', frame.getEncoded());
    });

    setTimeout(function() {
        var frame = new WebSocketFrame();

        frame.setFinal(true);
        frame.setOpcode(0x1);
        frame.setPayload(new Buffer('hi'));

        socket.write(frame.toBuffer());
    }, 500);
    
});

httpServer.listen(3000);