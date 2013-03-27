var crypto = require('crypto');

function WebSocketFrame(frame) {
    
}

WebSocketFrame.isGlued = function() {

};

WebSocketFrame.isSplitted = function() {

};

WebSocketFrame.prototype.concat = function() {

};

WebSocketFrame.prototype.addFragment = function() {

};

WebSocketFrame.prototype.getContent = function() {

};

WebSocketFrame.prototype.setContent = function() {

};

WebSocketFrame.prototype.validate = function() {

};

WebSocketFrame.prototype.isValid = function() {

};

WebSocketFrame.prototype.toBuffer = function() {

};

module.exports = WebSocketFrame;

function isFin(frame) {
    return Boolean(0x80 & frame[0]);
}

function isRsv1(frame) {
    return Boolean(0x40 & frame[0]);
}

function isRsv2(frame) {
    return Boolean(0x20 & frame[0]);
}

function isRsv3(frame) {
    return Boolean(0x10 & frame[0]);
}

function isMask(frame) {
    return Boolean(0x80 & frame[1]);
}

function hasOpcode(frame) {
    return 0x0f & frame[0];
}

function hasLength(frame) {
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

function hasOffset(frame) {
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

function hasMasking(frame) {
    if (!isMask(frame)) return;

    var offset = hasOffset(frame);
    
    return frame.slice(offset, offset + 4);
}

function hasPayload(frame) {
    var length = hasLength(frame);
    var offset = hasOffset(frame);

    if (isMask(frame)) {
        offset += 4;
    }

    return frame.slice(offset, length);
}

function mask(frame) {
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++)
        unmasked[i] = payload[i] ^ masking[i % 4];

    return unmasked;
}

function unmask(frame) {
    return mask(frame);
}
