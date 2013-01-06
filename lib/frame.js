var util    = require('util');
var events  = require('events');

var inherits        = util.inherits;
var EventEmitter    = events.EventEmitter;

function Frame(buff) {
    this.buff = buff;
}

inherits(Frame, EventEmitter);

Frame.prototype.header = function() {
    return this.buff[0];  
};

Frame.prototype.isFinal = function() {
    return ((this.buff[0] & 0x80) == 0x80);
};

Frame.prototype.getOpcode = function() {
    var opcode = (this.buff[0] & 0xF);

    if (opcode == 0x0) {
        return 'continuation';
    }
    if (opcode == 0x1) {
        return 'text';
    }
    if (opcode == 0x2) {
        return 'binary';
    }
    if (opcode == 0x8) {
        return 'close';
    }
    if (opcode == 0x9) {
        return 'ping';
    }
    if (opcode == 0xA) {
        return 'pong';
    }

    return 'reserved';
};

Frame.prototype.isMasked = function() {
    return ((this.buff[1] & 0x80) == 0x80);
};

Frame.prototype.getPayloadLength = function() {
    var payload = this.buff[1] & 0x7F;
};

module.exports = Frame;