var fs = require('fs');
var url = require('url');
var util = require('util');
var path = require('path');
var http = require('http');
var websockets = require('../../lib');

// create servers
var httpServer = new http.Server();

var imageSocketServer = new websockets.Server({ 
    url: "ws://localhost:3000/images", 
    opcode: 0x01, timeout: 0 
});

var messageSocketServer = new websockets.Server({ 
    url: "ws://localhost:3000/messages", 
    timeout: 0 
});

// pipe all incoming of the wssocket into the server
imageSocketServer.on('stream:start', function(wssocket) {
    wssocket.pipe(imageSocketServer);
});

// unpipe all incoming 
imageSocketServer.on('stream:end', function(wssocket) {
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
httpServer.on('request', function(request, response) {
    fs.createReadStream(path.join(__dirname + '/index.html'))
        .pipe(response);
});

httpServer.listen(3000);
