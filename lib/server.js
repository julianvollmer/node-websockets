var util    = require('util');
var events  = require('events');

var inherits        = util.inherits;
var EventEmitter    = events.EventEmitter;

function WebSocketServer() {
    
}

inherits(WebSocketServer, EventEmitter);

WebSocketServer.prototype.listen = function(httpServer) {
    httpServer.on('upgrade', (require('./upgrade')));

    return this;
};

module.exports = WebSocketServer;