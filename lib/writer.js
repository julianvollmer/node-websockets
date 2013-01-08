var util = require('util');
var stream = require('stream');

var Stream = stream.Stream;
var inherits = util.inherits;

function WebSocketWriter() {
    this.readable = true;
    this.writable = true;
}

inherits(WebSocketWriter, Stream);

WebSocketWriter.prototype.write = function() {};

module.exports = WebSocketWriter;