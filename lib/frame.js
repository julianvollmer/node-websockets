var util = require('util');
var crypto = require('crypto');

function WebSocketFrame(frame) {
    frame = (frame || new Buffer([0x81, 0x00]));

    this.frame = frame;
    this.fragments = [];
    
    this.fin = Boolean(0x80 & frame[0]);
    this.rsv1 = Boolean(0x40 & frame[0]);
    this.rsv2 = Boolean(0x20 & frame[0]);
    this.rsv3 = Boolean(0x10 & frame[0]);
    this.mask = Boolean(0x80 & frame[1]);

    this.offset = 0x02;
    this.opcode = 0x0f & frame[0];
    this.length = 0x7f & frame[1];

    switch (this.length) {
        case 126:
            this.length = frame.readUInt16BE(2);
            this.offset += 2;
            break;
        case 127:
            this.length = frame.readUInt32BE(6);
            this.offset += 8;
            break;
    }

    if (this.mask) {
        if (arguments.length > 0) {
            this.masking = frame.slice(this.offset, this.offset + 4);
        }
        this.offset += 4;
    } else {
        this.masking = new Buffer(0);
    }

    this.tlength = this.length + this.offset;

    this.payload = frame.slice(this.offset, this.tlength);
    this.remnant = frame.slice(this.tlength, frame.length);
}

WebSocketFrame.prototype.concat = function(endPayload) {
    if (this.length <= this.payload.length) return;

    var startPayload = this.payload;

    this.payload = Buffer.concat([startPayload, endPayload]);
};

WebSocketFrame.prototype.addFragment = function(fragFrame) {
    this.fragments.push(fragFrame);
};

WebSocketFrame.prototype.getContent = function() {
    if (this.fragments.length > 0) {
        var payloads = [];

        this.fragments.forEach(function(frag) {
            payload.push(frag.getContent());
        });

        return Buffer.concat(payloads);
    }
    
    return mask(this.masking, this.payload);
};

WebSocketFrame.prototype.setContent = function(content) {
    this.length = content.length;
    
    if (this.mask && !this.masking.length) {
        this.masking = crypto.randomBytes(4);
    }

    this.payload = mask(this.masking, content);
};

WebSocketFrame.prototype.validate = function() {
    if (this.rsv1) {
        return new Error('rsv1 should not be set');
    }
    if (this.rsv2) {
        return new Error('rsv2 should not be set');
    }
    if (this.rsv3) {
        return new Error('rsv3 should not be set');
    }
    if (0x02 < this.opcode && 0x0a > this.opcode) {
        return new Error(util.format('invalid opcode %d used', this.opcode));
    }

    return null;
};

WebSocketFrame.prototype.isValid = function() {
    var error = this.validate();

    if (error) {
        return false;
    } else {
        return true;
    }
};

WebSocketFrame.prototype.toBuffer = function() {
    var bytes = [];
 
    this.length = (this.length || 0);

    var lengthBytes;
    if (125 < this.length && 0xffff >= this.length) {
        lengthBytes = new Buffer(2);
        lengthBytes.writeUInt16BE(this.length, 0);
        this.length = 126;
    } else if (0xffff < this.length) {
        // we cannot write such big integers
        if (this.length > 0xffffffff) return;
        lengthBytes = new Buffer(8);
        lengthBytes.fill(0);
        lengthBytes.writeUInt32BE(this.length, 4);
        this.length = 127;
    }

    var head = new Buffer(2);
    head[0] = ((this.fin) ? 0x80 : 0x00) | this.opcode;
    head[1] = ((this.mask) ? 0x80 : 0x00) | this.length;
    bytes.push(head);

    if (this.mask && !this.masking.length) {
        this.masking = crypto.randomBytes(4);
    }

    if (lengthBytes) bytes.push(lengthBytes);
    if (this.masking) bytes.push(this.masking);
    if (this.payload) bytes.push(this.payload);

    return Buffer.concat(bytes);
};

WebSocketFrame.isGlued = isGlued;
WebSocketFrame.isSplitted = isSplitted;

module.exports = WebSocketFrame;

function mask(masking, payload) {
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++)
        unmasked[i] = payload[i] ^ masking[i % 4];

    return unmasked;
}

function isGlued(frame) {
    var wsframe = new WebSocketFrame(frame);

    return (wsframe.length + wsframe.offset) < frame.length;
}

function isSplitted(frame) {
    var wsframe = new WebSocketFrame(frame);

    return frame.length > wsframe.payload.length;
}
