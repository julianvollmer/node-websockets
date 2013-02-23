var http = require('http');
var websockets = require('../lib/index');

var server = http.createServer();

server.on('upgrade', function(req, socket) {
    websockets.Upgrade.handleUpgradeRequest(req, socket, function() {
        socket.on('data', function(data) {
            console.log(data);
        });
        socket.write(new Buffer([0x81, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f]));
    });
});

server.listen(3000);
