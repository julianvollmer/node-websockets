var Frame   = require('./frame');
var helper  = require('./helper');

var isFlagSet = helper.isFlagSet;
var getFourBits = helper.getFourBits;

function parseFrame(buff) {
    var frame = new Frame();

    frame.last = isFlagSet(buff[0], 0x80);
    frame.masked = isFlagSet(buff[1], 0x80);
    
    frame.opcode = getFourBits(buff[0]);

    frame.length = parseFrameLength(buff.slice(1));

    frame.payload = buff.slice(buff.length - frame.length - 1, frame.length);

    return frame;
};

function parseFrameLength(buff) {
    var firstByte = buff[0];

    if (firstByte < 125) {
        //return buff.slice(0, 1);
        return buff[0];
    }
    if (firstByte == 126) {
        //return buff.slice(1, 3);
        return buff[1] * 256 + buff[0];
    }
    if (firstByte == 127) {
        //return buff.slice(1, 9);
        var length = this.buff[2];

        for (var i = 1; i < 9; i++) {
            length += this.buff[i + 2] * Math.pow(2, 8 * i);
        }

        return length;
    }
}

function mask(mask, payload) {
    var data = new Buffer(payload.length);

    for (var i = 0; i < payload.length; i++) {
        data[i] = payload[i] ^ mask[i % 4];
    }

    return data;
}

module.exports = parseFrame;