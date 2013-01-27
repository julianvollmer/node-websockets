var http    = require('http');

var Upgrade = require('../lib/upgrade');
var WebSocketFrame = require('../lib/frame');

var httpServer = http.createServer();

httpServer.on('request', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
});

httpServer.on('upgrade', Upgrade.serverUpgrade);

httpServer.on('upgrade', function(req, socket) {
    if (!Upgrade.isWebSocketUpgrade) return;

    socket.on('data', function(raw) {
        var frame = new WebSocketFrame(raw);

        console.log('raw :', raw);
        console.log('final: ', frame.isFinal());
        console.log('masked: ', frame.isMasked());
        console.log('opcode: ', frame.getOpcode());
        console.log('length: ', frame.getLength());
        console.log('masking: ', frame.getMasking());
        console.log('payload: ', frame.getPayload());
        console.log('decoded payload: ', frame.getData());
        console.log('decoded payload as string: ', frame.getData().toString());
    });

    setTimeout(function() {
        var frame = new WebSocketFrame();

        frame.setFinal(true);
        frame.setMasked(false);
        frame.setOpcode(0x1);
        frame.setPayload(new Buffer('hi'));

        socket.write(frame.toBuffer());
    }, 500);
    
});

httpServer.listen(3000);