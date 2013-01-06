var util    = require('util');
var events  = require('events');
var upgrade = require('./upgrade');

var inherits        = util.inherits;
var EventEmitter    = events.EventEmitter;

function WebSocketServer() {
    
}

inherits(WebSocketServer, EventEmitter);

WebSocketServer.prototype.listen = function(httpServer) {
    httpServer.on('upgrade', upgrade);

    return this;
};

module.exports = WebSocketServer;