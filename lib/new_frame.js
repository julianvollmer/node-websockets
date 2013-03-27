var util = require('util');
var crypto = require('crypto');

function WebSocketFrame(frame) {
    frame = (frame || new Buffer([0x81, 0x00]);

    this.frame = frame;
    this.fragments = [];
    
    this.fin = Boolean(0x80 & frame[0]);
    this.rsv1 = Boolean(0x40 & frame[0]);
    this.rsv2 = Boolean(0x20 & frame[0]);
    this.rsv3 = Boolean(0x10 & frame[0]);
    this.mask = Boolean(0x80 & frame[1]);

    this.opcode = 0x0f & frame[0];
    this.length = getLength(frame);
    this.masking = getMasking(frame);
    this.payload = getPayload(frame);
    this.remnant = getRemnant(frame);
}

WebSocketFrame.prototype.get = function(key) {
    return this[key];
};

WebSocketFrame.prototype.set = function(key, value) {
    this[key] = value;

    return this;
};

WebSocketFrame.prototype.concat = function(endPayload) {
    if (!isSplitted(frame)) return;

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
    
    if (this.mask && !this.masking) {
        this.masking = crypto.randomBytes(4);
        this.payload = mask(this.masking, content);
    }
    
    this.content = content;
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

    var head = new Buffer(2);
    head[0] = ((this.fin) ? 0x80 : 0x00) & this.opcode;
    head[1] = ((this.mask) ? 0x80 : 0x00) & this.length;
    bytes.push(head);

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
    if (lengthBytes) bytes.push(lengthBytes);
    if (this.masking) bytes.push(this.masking);
    if (this.payload) bytes.push(this.payload);

    return Buffer.concat(bytes);
};

WebSocketFrame.isGlued = isGlued;
WebSocketFrame.isSplitted = isSplitted;

module.exports = WebSocketFrame;

function mask(frame) {
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++)
        unmasked[i] = payload[i] ^ masking[i % 4];

    return unmasked;
}

function getLength(frame) {
    var length = 0x7f & frame[1];

    if (126 == length) {
        length = frame.readUInt16BE(2);
    }
    if (127 == length) {
        // cannot read the other four bytes
        // because bit shifting with << 32
        // busts javascript limit
        length = frame.readUInt32BE(6);
    }

    return length;
}

function getOffset(frame) {
    var offset = 2;
    var length = 0x7f & frame[1];

    if (126 == length) {
        offset += 2;
    }
    if (127 == length) {
        offset += 8;
    }

    return offset;
}

function getMasking(frame) {
    if (!isMask(frame)) return;

    var offset = getOffset(frame);
    
    return frame.slice(offset, offset + 4);
}

function getPayload(frame) {
    var length = getLength(frame);
    var offset = getOffset(frame);

    if (isMask(frame)) {
        offset += 4;
    }

    return frame.slice(offset, length, true);
}

function getRemnant(frame) {
    if (!isGlued(frame)) return;

    var frameLength = getFrameLength(frame);

    return frame.slice(0, frameLength, true);
}

function getFrameLength(frame) {
    var length = getLength(frame);
    var offset = getOffset(frame);

    if (isMask(frame)) {
        offset += 4;
    }

    return length + offset;
}

function isGlued(frame) {
    var length = getLength(frame);
    var offset = getOffset(frame);

    if (isMask(frame)) {
        offset += 4;
    }

    var frameLength = length + offset;

    return frameLength < frame.length;
}

function isSplitted(frame) {
    var length = getLength(frame);
    var payload = getPayload(frame);

    return length > payload.length;
}
