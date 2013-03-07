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

imageSocketServer.on('message', function(message, sid) {
    imageSocketServer.send(message);
});

// informs about new clients connected
messageSocketServer.on('open', function(sid) {
    messageSocketServer.send(util.format('Client no. %d has connected', sid));
});

// informs about clients left
messageSocketServer.on('close', function(reason, sid) {
    messageSocketServer.send(util.format('Client no. %s has left', sid));
});

// shares a sent message through all clients
messageSocketServer.on('message', function(message, sid) {
    console.log('message:', message);
    messageSocketServer.send(message);
});

imageSocketServer.listen(httpServer);
messageSocketServer.listen(httpServer);

httpServer.listen(3000);
