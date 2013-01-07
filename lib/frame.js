var util    = require('util');
var events  = require('events');

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
    // TODO: test this (and make it shorter)
    var head = this.headers[0] & 0xF;

    return (head == 0x8 || head == 0x9 || head == 0xA);
};

Frame.prototype.getMask = function() {
    if (!this.isMasked()) return;

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

Frame.prototype.getData = function() {
    // TODO: test pleas

    return mask(this.getMask(), this.getPayload());  
};

Frame.prototype.setData = function(data) {
    // TODO: implement
      
};

Frame.prototype.getPayload = function() {
    
    return this.payload;  
};

Frame.prototype.getPayloadLength = function() {
    var length = this.headers[1] & 0x7F;

    if (length < 126) {
        return length;
    }

    if (length > 125) {
        // TODO: reread RFC 6455
    }
};

Frame.prototype.maskPayload = function() {

    return null;
};

Frame.prototype.unmaskPayload = function() {
    var mask = this.getMask();
    var payload = this.getPayload();

    for (var i = 0; i < payload.length; i++) {
        payload[i] = payload[i] ^ mask[i % 4];
    }

    return payload;
};

function mask(key, payload) {
    // TODO: test
    var data = new Buffer(payload.length);

    for (var i = 0; i < payload.length; i++) {
        data[i] = payload[i] ^ mask[i % 4];
    }

    return data;
}

module.exports = Frame;