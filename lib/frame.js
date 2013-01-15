/**
 * WebSocket Frame helper.
 *
 * This class helps you build and read WebSocket frames.
 * You either pass in a rawFrame to map its byte sequence
 * to a readable state or pass nothing to set the flags, data
 * yourself over the api.
 *
 * @param   {Buffer}    rawFrame
 */
function WebSocketFrame(rawFrame) {
    this.final = parseFinal(rawFrame) || true;
    this.masked = parseFinal(rawFrame) || false;

    this.opcode = parseOpcode(rawFrame) || 0x1;
    this.length = parseLength(rawFrame) || 0x0;

    this.masking = parseMasking(rawFrame, this.length, this.masked) || null;
    this.payload = parsePayload(rawFrame, this.length, this.masked) || null;
}

/**
 * Returns true if fin flag set.
 *
 * @return  {Boolean}
 */
WebSocketFrame.prototype.isFinal = function() {

    return this.final;
};

/**
 * Sets fin flag to boolean.
 *
 * @param   {Boolean}   bool
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setFinal = function(bool) {
    this.final = bool;

    return this;
};

/**
 * Returns true if masked
 *
 * @return  {Boolean}
 */
WebSocketFrame.prototype.isMasked = function() {

    return this.masked;
};

/**
 * Sets masked flag to boolean.
 *
 * @param   {Boolean}   bool
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setMasked = function(bool) {
    this.masked = bool;
  
    return this;  
};

/**
 * Returns opcode of frame.
 *
 * @return  {Number}
 */
WebSocketFrame.prototype.getOpcode = function() {

    return this.opcode;
};

/**
 * Sets opcode of frame.
 *
 * @param   {Number}   hex
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setOpcode = function(hex) {
    this.opcode = hex;

    return this;
};

/**
 * Returns masking key.
 *
 * @return  {Buffer}
 */
WebSocketFrame.prototype.getMasking = function() {

    return this.masking;
};

/**
 * Returns payload length in bytes.
 *
 * @return  {Number}
 */
WebSocketFrame.prototype.getLength = function() {

    return this.length;
};

/**
 * Sets payload length manuelly.
 *
 * @param   {Number}   len
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setLength = function(len) {
    this.length = len;
    
    return this;  
};

/**
 * Returns payload buffer.
 *
 * @return  {Buffer}
 */
WebSocketFrame.prototype.getPayload = function() {

    return this.payload;
};

/**
 * Sets payload buffer.
 *
 * @param   {Buffer}   payload
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setPayload = function(payload) {
    this.payload = payload;

    this.setLength(payload.length);
    
    return this;  
};

/**
 * Returns decoded payload.
 *
 * @return  {Buffer}
 */
WebSocketFrame.prototype.getDecodedPayload = function() {
    return unmask(this.getMasking(), this.getPayload());
};

/**
 * Transforms all attributes to raw frame buffer.
 * 
 * TODO: allow lengths above 125
 *
 * @return  {Buffer}
 */
WebSocketFrame.prototype.toBuffer = function() {
    var rawFrame = new Buffer(2);

    rawFrame[0] = 0x80 | this.opcode;
    rawFrame[1] = this.length || this.payload.length;

    return Buffer.concat([rawFrame, this.payload]);
};

/**
 * Unmasks a payload with a masking key.
 *
 * @param   {Buffer}    masking
 * @param   {Buffer}    payload
 * @param   {Buffer}
 */
function unmask(masking, payload) {
    if (!masking || !payload) return;
    
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++) {
        unmasked[i] = payload[i] ^ masking[i % 4];
    }

    return unmasked;
}

/**
 * Extracts fin flag out of frame buffer.
 *
 * @param   {Buffer}    rawFrame
 * @return  {Boolean}
 */
function parseFinal(rawFrame) {
    if (!rawFrame) return;

    return (rawFrame[0] & 0x80) == 0x80;
}

/**
 * Extracts mask flag out of frame buffer.
 *
 * @param   {Buffer}    rawFrame
 * @return  {Boolean}
 */
function parseMasked(rawFrame) {
    if (!rawFrame) return;
    
    return (rawFrame[1] & 0x80) == 0x80;
}

/**
 * Extracts the opcode out of frame buffer.
 *
 * @param   {Buffer}    rawFrame
 * @return  {Number}
 */
function parseOpcode(rawFrame) {
    if (!rawFrame) return;
    
    return rawFrame[0] & 0xf;
}

/**
 * Extracts payload length in bytes out of frame buffer.
 *
 * @param   {Buffer}    rawFrame
 * @return  {Number}
 */
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

/**
 * Extracts masking bytes out of frame buffer.
 *
 * @param   {Buffer}    rawFrame
 * @param   {Number}    length
 * @param   {Boolean}   masked
 * @return  {Buffer}
 */
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

/**
 * Extracts payload bytes out of frame buffer.
 *
 * @param   {Buffer}    rawFrame
 * @param   {Number}    length
 * @param   {Boolean}   masked
 * @return  {Buffer}
 */
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

module.exports = WebSocketFrame;