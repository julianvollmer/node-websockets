var net = require('net');
var util = require('util');
var events = require('events');

var WebSocketFrame = require('./frame');

var inherits = util.inherits;
var EventEmitter = events.EventEmitter;

function WebSocketSocket() {
    
}

inherits(WebSocketSocket, EventEmitter);

WebSocketSocket.prototype.write = function() {

};

WebSocketSocket.prototype.assign = function() {

};

WebSocketSocket.prototype.destroy = function() {

};

module.exports = WebSocketSocket;
