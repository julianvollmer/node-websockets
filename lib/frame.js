var util    = require('util');
var events  = require('events');
var crypto  = require('crypto');

var inherits        = util.inherits;
var EventEmitter    = events.EventEmitter;

function Frame(buff) {
    this.buff = buff;
    this.headers = new Buffer(2);
    this.masking = new Buffer(4);

    buff.copy(this.headers, 0, 0, 2);

    var len = this.getPayloadLength();

    this.payload = new Buffer(len);

    if (this.isMasked()) {
        buff.copy(this.masking, 0, 2, 6);
        buff.copy(this.payload, 0, 6);
    } else {
        // TODO: check if 2 is right
        buff.copy(this.payload, 0, 2);
    }
}

inherits(Frame, EventEmitter);

Frame.prototype.isFinal = function() {

    return (this.headers[0] & 0x80) == 0x80;
};

Frame.prototype.isMasked = function() {

    return (this.headers[1] & 0x80) == 0x80;
};

Frame.prototype.isControl = function() {
    var head = this.headers[0] & 0xF;

    return (head == 0x8 || head == 0x9 || head == 0xA);
};

Frame.prototype.getMask = function() {
    if (!this.isMasked()) return;

    return this.masking;
};

Frame.prototype.createMask = function() {
    this.masking = createMask();  

    return this.masking;
};

Frame.prototype.getOpcode = function() {
    switch (this.headers[0] & 0xF) {
        default:
            return 'reserved'; 
            break;
        case 0x0:
            return 'continuation'; 
            break;
        case 0x1:
            return 'text'; 
            break;
        case 0x2:
            return 'binary';
            break;
        case 0x8:
            return 'close'; 
            break;
        case 0x9:
            return 'ping'; 
            break;
        case 0xA:
            return 'pong'; 
            break;
    }
};

Frame.prototype.setOpcode = function(code) {
    this.headers[0] = (this.headers[0] & 0xFFFFFFF0) | (code & 0xF);
};

Frame.prototype.getData = function() {
    var data = mask(this.getMask(), this.getPayload());

    if (this.getOpcode() == 'text') {
        return data.toString('utf8');
    }

    return data;
};

Frame.prototype.setData = function(data) {
    // TODO: implement
    
};

Frame.prototype.getPayload = function() {
    
    return this.payload;  
};

Frame.prototype.getPayloadLength = function() {
    var length = this.headers[1] & 0x7F;

    if (length < 125) {
        return length;
    }

    // TODO: check this
    if (length > 125) {
        return this.buff[2] * 256 + this.buff[3];
    }

    // TODO: check this too
    if (length == 127) {
        var length = this.buff[2];

        for (var i = 1; i < 9; i++) {
            length += this.buff[i + 2] * Math.pow(2, 8 * i);
        }
    }
};

function mask(mask, payload) {
    var data = new Buffer(payload.length);

    for (var i = 0; i < payload.length; i++) {
        data[i] = payload[i] ^ mask[i % 4];
    }

    return data;
}

function createMask() {
    return crypto.randomBytes(4);
}

module.exports = Frame;