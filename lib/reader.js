var util = require('util');
var stream = require('stream');

var Stream = stream.Stream;
var inherits = util.inherits;

function WebSocketReader() {
    this.readable = true;
    this.writable = true;
}

inherits(WebSocketReader, Stream);

WebSocketReader.prototype.write = function(buff) {
    this.readHead({}, buff);
};

WebSocketReader.prototype.readHead = function(frame, buff) {
    frame.last = (buff[0] & 0x80) == 0x80;
    frame.opcode = (buff[0] & 0xf);

    this.readMask(frame, buff.slice(1));
};

WebSocketReader.prototype.readMask = function(frame, buff) {
    frame.mask = (buff[0] & 0x80) == 0x80;

    this.readLength(frame, buff);
};

WebSocketReader.prototype.readLength = function(frame, buff) {
    var len = buff[0] & 0x7f;

    buff = buff.slice(1);

    if (len == 126) {
        len = buff[0] * 256 + buff[1];
        buff = buff.slice(3);
    }
    if (len == 127) {
        len = this.buff[0];

        for (var i = 1; i < 9; i++) {
            len += this.buff[i] * Math.pow(2, 8 * i);
        }

        buff = buff.slice(9);
    }

    frame.length = len;

    this.readMasking(frame, buff);
};

WebSocketReader.prototype.readMasking = function(frame, buff) {
    if (frame.mask) {
        frame.masking = buff.slice(0, 4);
        buff = buff.slice(4);
    }

    this.readPayload(frame, buff);
};

WebSocketReader.prototype.readPayload = function(frame, buff) {
    frame.payload = buff;

    this.readData(frame);
};

WebSocketReader.prototype.readData = function(frame) {
    var mask = frame.masking;
    var payload = frame.payload;

    frame.data = new Buffer(frame.length);

    for (var i = 0; i < frame.length; i++) {
        frame.data[i] = payload[i] ^ mask[i % 4];
    }

    this.encodeData(frame);
};

WebSocketReader.prototype.encodeData = function(frame) {
    // TODO: some chars are received wrong

    if (frame.opcode == 0x1) {
        frame.data = frame.data.toString('utf8');
    }

    this.emit('data', frame.data, frame);
};

module.exports = WebSocketReader;