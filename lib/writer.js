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
    frame.masked = true;

    frame.opcode = 0x1;

    frame.data = data;

    this.writeRaw(frame)
};

WebSocketWriter.prototype.writeRaw = function(frame) {
    // TODO: support lengths above 125 bytes
    frame.raw = new Buffer(6 + frame.data.length);

    this.writeHead(frame);
};

WebSocketWriter.prototype.writeHead = function(frame) {
    var raw = frame.raw;

    if (frame.final) {
        raw[0] = raw[0] | 128;
    }
    if (frame.masked) {
        raw[1] = raw[1] | 128;
    }

    // sets opcode bits
    raw[0] = raw[0] | frame.opcode;

    raw[1] = frame.data.length;

    this.writeMask(frame);
};

WebSocketWriter.prototype.writeMask = function(frame) {
    var mask = frame.mask = crypto.randomBytes(4);

    for (var i = 0; i < mask.length; i++) {
        frame.raw[frame.raw.length + i] = mask[0];
    }

    this.writePayload(frame);
};

WebSocketWriter.prototype.writePayload = function(frame) {
    var mask = frame.mask;
    var payload = new Buffer(frame.data.length);

    for (var i = 0; i < frame.length; i++) {
        frame.data[i] = payload[i] ^ mask[i % 4];
    }

    frame.payload = payload;

    for (var i = 0; i < frame.payload; i++) {
        frame.raw[frame.raw.length + i] = payload[i];
    }

    this.finalWrite(frame);
};

WebSocketWriter.prototype.finalWrite = function(frame) {
    this.socket.write(frame.raw.toString('utf-8'));  
};

module.exports = WebSocketWriter;