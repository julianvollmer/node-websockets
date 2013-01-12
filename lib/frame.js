function WebSocketFrame(rawFrame) {
    this.final = parseFinal(rawFrame) || true;
    this.masked = parseFinal(rawFrame) || false;

    this.opcode = parseOpcode(rawFrame) || 0x1;
    this.length = parseLength(rawFrame) || 0x0;

    this.masking = parseMasking(rawFrame, this.length, this.masked) || null;
    this.payload = parsePayload(rawFrame, this.length, this.masked) || null;

    this.encoded = unmaskPayload(this.masking, this.payload) || null;
}

WebSocketFrame.prototype.isFinal = function() {

    return this.final;
};

WebSocketFrame.prototype.setFinal = function(bool) {
    this.final = bool;

    return this;
};

WebSocketFrame.prototype.isMasked = function() {

    return this.masked;
};

WebSocketFrame.prototype.setMasked = function(bool) {
    this.masked = bool;
  
    return this;  
};

WebSocketFrame.prototype.getOpcode = function() {

    return this.opcode;
};

WebSocketFrame.prototype.setOpcode = function(hex) {
    this.opcode = hex;

    return this;
};

WebSocketFrame.prototype.getMasking = function() {

    return this.masking;
};

WebSocketFrame.prototype.getLength = function() {

    return this.length;
};

WebSocketFrame.prototype.setLength = function(len) {
    this.length = len;
    
    return this;  
};

WebSocketFrame.prototype.getPayload = function() {

    return this.payload;
};

WebSocketFrame.prototype.setPayload = function(payload) {
    this.payload = payload;

    this.setLength(payload.length);
    
    return this;  
};

WebSocketFrame.prototype.getEncoded = function() {
    if ((this.opcode & 0x1) == 0x1) {
        return this.encoded.toString();
    }
    return this.encoded;
};

WebSocketFrame.prototype.setEncoded = function(data) {
    if (typeof data == 'string') {
        data = new Buffer(data);
    }  

    this.setPayload(data);
    this.setEncoded(data);

    return this;
};

WebSocketFrame.prototype.toBuffer = function() {
    var frameLength = 2 + this.length;

    var rawFrame = new Buffer(frameLength);

    rawFrame[0] = 0x80 | this.opcode;
    rawFrame[1] = this.length || this.payload.length;
    
    return Buffer.concat([rawFrame, this.payload]);
};

function parseFinal(rawFrame) {
    if (!rawFrame) return;

    return (rawFrame[0] & 0x80) == 0x80;
}

function parseMasked(rawFrame) {
    if (!rawFrame) return;
    
    return (rawFrame[1] & 0x80) == 0x80;
}

function parseOpcode(rawFrame) {
    if (!rawFrame) return;
    
    return rawFrame[0] & 0xf;
}

function parseLength(rawFrame) {
    if (!rawFrame) return;

    var len = rawFrame[1] & 0x7f;

    if (len == 126) {
        len = rawFrame[2] * 256 + rawFrame[3];
    }
    if (len == 127) {
        len = rawFrame[9];

        // TODO: recheck this algorithm please
        // I am not sure if to count the bytes together
        // from left to right ot right to left...
        for (var i = 8; i > 2; i--) {
            len += rawFrame[i] * Math.pow(2, 8 * i);
        }
    }

    return len;
}

function parseMasking(rawFrame, length, masked) {
    if (!masked) return;
    if (!rawFrame) return;
    

    if (length < 126) {
        return rawFrame.slice(2, 6);
    }
    if (length == 126) {
        return rawFrame.slice(4, 8);
    }
    if (length == 127) {
        return rawFrame.slice(10, 14);
    }
}

function parsePayload(rawFrame, length, masked) {
    if (!rawFrame) return;
    
    // TODO:
    // actually use the length to get the payload
    // not automatically take the whole length of the rawFrame

    var offset = (masked) ? 4 : 0;

    if (length < 126) {
        return rawFrame.slice(2 + offset);
    }
    if (length == 126) {
        return rawFrame.slice(4 + offset);
    }
    if (length == 127) {
        return rawFrame.slice(10 + offset);
    }
}

function unmaskPayload(masking, payload) {
    if (!masking || !payload) return;
    
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++) {
        unmasked[i] = payload[i] ^ masking[i % 4];
    }

    return unmasked;
}

module.exports = WebSocketFrame;