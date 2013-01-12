var util = require('util');
var stream = require('stream');
var crypto = require('crypto');

var Stream = stream.Stream;
var inherits = util.inherits;

var WebSocketFrame = require('./frame');

// ATTENTION:
// Writer currently broken!
// Will cause crash use Frame directly instead!

function WebSocketWriter(socket) {
    this.socket = socket;

    this.readable = true;
    this.writable = true;
}

inherits(WebSocketWriter, Stream);

WebSocketWriter.prototype.write = function(data) {
    var frame = new WebSocketFrame();

    frame.setFinal(true);
    frame.setOpcode(0x2);

    if (typeof data == 'string') {
        frame.setOpcode(0x1);
    }

    frame.setEncoded(data);

    console.log(frame.toBuffer());

    this.socket.write(frame.toBuffer());
};

module.exports = WebSocketWriter;