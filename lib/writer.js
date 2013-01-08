var util = require('util');
var stream = require('stream');
var crypto = require('crypto');

var Stream = stream.Stream;
var inherits = util.inherits;

function WebSocketWriter(socket) {
    this.socket = socket;
    this.readable = true;
    this.writable = true;
}

inherits(WebSocketWriter, Stream);

WebSocketWriter.prototype.write = function(data) {
    var frame = {};

    if (typeof data == 'string') {
        data = new Buffer(data);
    }

    frame.final = true;
    frame.masked = false;

    frame.opcode = 0x1;

    frame.data = data;

    this.writeHead(frame)
};

WebSocketWriter.prototype.writeHead = function(frame) {
    var head = frame.head = new Buffer(2);

    // sets opcode bits
    head[0] = 0x80 | frame.opcode;
    head[1] = frame.data.length;

    this.finalWrite(frame);
};

WebSocketWriter.prototype.finalWrite = function(frame) {
    var rawFrame = Buffer.concat([frame.head, frame.data]);
    console.log(rawFrame);

    this.socket.write(rawFrame);  
};

module.exports = WebSocketWriter;