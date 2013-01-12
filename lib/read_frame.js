function ReadFrame(rawFrame) {
    this.final = parseFinal(rawFrame);
    this.masked = parseFinal(rawFrame);

    this.opcode = parseOpcode(rawFrame);
    this.length = parseLength(rawFrame);

    this.masking = parseMasking(rawFrame, this.length, this.masked);
    this.payload = parsePayload(rawFrame, this.length, this.masked);

    this.encoded = unmaskPayload(this.masking, this.payload);
}

ReadFrame.prototype.isFinal = function() {

    return this.final;
};

ReadFrame.prototype.isMasked = function() {

    return this.masked;
};

ReadFrame.prototype.getOpcode = function() {

    return this.opcode;
};

ReadFrame.prototype.getMasking = function() {

    return this.masking;
};

ReadFrame.prototype.getLength = function() {

    return this.length;
};

ReadFrame.prototype.getPayload = function() {

    return this.payload;
};

ReadFrame.prototype.getEncodedPayload = function() {
    if ((this.opcode & 0x1) == 0x1) {
        return this.encoded.toString();
    }
    return this.encoded;
};

function parseFinal(rawFrame) {

    return (rawFrame[0] & 0x80) == 0x80;
}

function parseMasked(rawFrame) {

    return (rawFrame[1] & 0x80) == 0x80;
}

function parseOpcode(rawFrame) {

    return rawFrame[0] & 0xf;
}

function parseLength(rawFrame) {
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
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++) {
        unmasked[i] = payload[i] ^ masking[i % 4];
    }

    return unmasked;
}

module.exports = ReadFrame;