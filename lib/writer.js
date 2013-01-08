var util = require('util');
var stream = require('stream');

var Stream = stream.Stream;
var inherits = util.inherits;

function WebSocketWriter(socket) {
    this.socket = socket;
    this.readable = true;
    this.writable = true;
}

inherits(WebSocketWriter, Stream);

WebSocketWriter.prototype.write = function(data) {

};

WebSocketWriter.prototype.finalWrite = function(frame) {
    this.socket(frame);  
};

module.exports = WebSocketWriter;