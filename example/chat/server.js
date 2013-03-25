var fs = require('fs');
var url = require('url');
var util = require('util');
var path = require('path');
var http = require('http');

var websockets = require('../../lib/index');

// create servers
var httpServer = http.createServer();
var imageSocketServer = new websockets.Server({ url: "ws://localhost:3000/images", timeout: 0 });
var messageSocketServer = new websockets.Server({ url: "ws://localhost:3000/messages", timeout: 0 });

imageSocketServer.on('message', function(message, wssocket) {
    imageSocketServer.broadcast(message);
});

// informs about new clients connected
messageSocketServer.on('open', function(wssocket) {
    messageSocketServer.broadcast(util.format('Client #%d has connected', wssocket.index));
});

// informs about clients left
messageSocketServer.on('close', function(reason, wssocket) {
    messageSocketServer.broadcast(util.format('Client #%d has left', wssocket.index));
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
