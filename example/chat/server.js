var fs = require('fs');
var url = require('url');
var util = require('util');
var path = require('path');
var http = require('http');

var websockets = require('../../lib/index');

// create servers
var httpServer = new http.Server();
var imageSocketServer = new websockets.Server({ url: "ws://localhost:3000/images", opcode: 0x01, timeout: 0 });
var messageSocketServer = new websockets.Server({ url: "ws://localhost:3000/messages", timeout: 0 });

var first = true;

imageSocketServer.on('stream:start', function(wssocket) {
    console.log('starting stream');
    wssocket.pipe(imageSocketServer);
});

imageSocketServer.on('stream:end', function(wssocket) {
    console.log('ending stream');
    wssocket.unpipe(imageSocketServer);
});

// informs about new clients connected
messageSocketServer.on('open', function(wssocket) {
    wssocket.send(util.format('Welcome client #%d', wssocket.id));
    messageSocketServer.broadcast(util.format('Client #%d has connected', wssocket.id));
});

// informs about clients left
messageSocketServer.on('close', function(code, wssocket) {
    messageSocketServer.broadcast(util.format('Client #%d has left', wssocket.id));
});

// shares a sent message through all clients
messageSocketServer.on('message', function(message, wsocket) {
    console.log('message:', message);
    messageSocketServer.broadcast(message);
});

imageSocketServer.listen(httpServer);
messageSocketServer.listen(httpServer);

// server static files
httpServer.on('request', function(req, res) {
    var urll = url.parse(req.url);
    var filePath = path.join(__dirname + '/public', urll.pathname);

    fs.exists(filePath, function(exists) {
        if (!exists) {
            res.writeHead(404);
            res.end('404 Not Found\n');

            return;
        }

        if (fs.statSync(filePath).isDirectory())
            filePath += 'index.html';

        fs.readFile(filePath, function(err, file) {
            if (err) {
                res.writeHead(500);
                res.write('500 Internal Server Error\n');

                return;
            }

            res.writeHead(200);
            res.end(file);
        });
    });
});

httpServer.listen(3000);
