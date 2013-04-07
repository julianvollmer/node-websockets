var util = require('util');
var stream = require('stream');

function WebSocketOutgoing() {

}

util.inherits(WebSocketOutgoing, stream.Writable);

WebSocketOutgoing.prototype._write = function() {

};

module.exports = WebSocketOutgoing;
