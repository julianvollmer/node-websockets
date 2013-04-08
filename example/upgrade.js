var http = require('http');
var upgrade = require('../lib/index').upgrade;

var server = http.createServer();

server.on('upgrade', function(req, socket) {
    upgrade.handleUpgradeRequest(req, socket, function() {
        socket.on('readable', function() {
            var chunk = socket.read();

            console.log('chunk', chunk);
        });
        socket.write(new Buffer([0x81, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f]));
    });
});

server.listen(3000);
