var fs = require('fs');
var url = require('url');
var util = require('util');
var path = require('path');
var http = require('http');

var websockets = require('../../lib/index');

// create servers
var httpServer = http.createServer();
var socketServer = websockets.createServer();

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

// informs about new clients connected
socketServer.on('open', function(sid) {
    socketServer.send(util.format('Client no. %d has connected', sid));
});

// informs about clients left
socketServer.on('close', function(reason, sid) {
    socketServer.send(util.format('Client no. %s has left', sid));
});

// shares a sent message through all clients
socketServer.on('message', function(message, sid) {
    console.log('message:', message);
    socketServer.send(message);
});

socketServer.listen(httpServer);

httpServer.listen(3000);
