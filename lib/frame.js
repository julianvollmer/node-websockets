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
    return ((this.buff[0] & 128) === 128);
};

// TODO: use official hex code for comparision
Frame.prototype.getOpcode = function() {
    var opcode = (this.buff[0] & 0xf);

    if (opcode == 0) {
        return 'continuation';
    }
    if (opcode == 1) {
        return 'text';
    }
    if (opcode == 2) {
        return 'binary';
    }
    if (opcode == 8) {
        return 'close';
    }
    if (opcode == 9) {
        return 'ping';
    }
    if (opcode == 10) {
        return 'pong';
    }

    return 'reserved';
};


module.exports = Frame;