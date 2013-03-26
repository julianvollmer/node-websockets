var util = require('util');
var http = require('http');
var crypto = require('crypto');

var server = http.createServer();

server.on('request', function(request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end('Hello World');
});

server.on('upgrade', function(request, socket) {
    var accept = generateAccept(request.headers['sec-websocket-key']);

    socket.on('data', function(chunk) {
        var fin = Boolean(0x80 & chunk[0]);
        var rsv1 = Boolean(0x40 & chunk[0]);
        var rsv2 = Boolean(0x20 & chunk[0]);
        var rsv3 = Boolean(0x10 & chunk[0]);
        var mask = Boolean(0x80 & chunk[1]);

        var opcode = 0x0f & chunk[0];
        var length = 0x7f & chunk[1];

        var masking, payload;
        if (mask) {
            masking = chunk.slice(2, 6);
            payload = chunk.slice(6, 6 + length);
        } else {
            masking = new Buffer(0);
            payload = chunk.slice(2, 2 + length);
        }

        var content = unmask(masking, payload);

        if (0x01 === opcode)
            console.log('message:', content.toString());
    });

    socket.write(util.format(
        'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: upgrade\r\n' +
        'Sec-WebSocket-Accept: %s\r\n' +
        'Sec-WebSocket-Version: 13\r\n' +
    '\r\n', accept));
});

server.listen(3000);

function unmask(masking, payload) {
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++) {
        unmasked[i] = payload[i] ^ masking[i % 4];
    }

    return unmasked;
}

function generateAccept(key) {
    var GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    return crypto.createHash('sha1').update(key.trim() + GUID).digest('base64');
}
