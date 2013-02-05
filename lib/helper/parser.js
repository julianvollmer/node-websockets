var crypto = require('crypto');

/**
 * Returns a unmasked buffer using the WebSocket masking algorithm.
 * 
 * @param   {Buffer}    masking
 * @param   {Buffer}    payload
 * @return  {Buffer}
 */
function mask(masking, payload) {
    if (!masking || !payload) return;
    
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++) {
        unmasked[i] = payload[i] ^ masking[i % 4];
    }

    return unmasked;
}

/**
 * Returns true if WebSocket frame has set final flag.
 * 
 * @param   {Buffer}    frame
 * @param   {Boolean}
 */
function isFinal(frame) {
    if (!frame) return;

    return (frame[0] & 0x80) == 0x80;   
}

/**
 * Returns true if WebSocket frame has set masked flag.
 * 
 * @param   {Buffer}    frame
 * @param   {Boolean}
 */
function isMasked(frame) {
    if (!frame) return;
    
    return (frame[1] & 0x80) == 0x80;
}

/**
 * Returns true if WebSocket frame has given opcode.
 * 
 * @depreceated
 * @param   {Buffer}    frame
 * @param   {Number}    opcode
 * @param   {Boolean}
 */
function hasOpcode(frame, opcode) {
    if (!frame || !opcode) return;
    
    return getOpcode(frame) == opcode;
}

/**
 * Returns the opcode of the WebSocket frame.
 * 
 * @param   {Buffer}    frame
 * @return  {Number}
 */
function getOpcode(frame) {
    if (!frame) return;
    
    return frame[0] & 0xF;    
}

/**
 * Returns the value of the payload length defined in the WebSocket frame.
 * 
 * @param   {Buffer}    frame
 * @return  {Number}
 */
function getLength(frame) {
    if (!frame) return;

    var length = frame[1] & 0x7f;

    switch (length) {
        case 126:
            length = parseBufferAsInteger(frame.slice(2, 4));
            break;
        case 127:
            length = parseBufferAsInteger(frame.slice(2, 10));
            break;
    }
    
    return length; 
}

/**
 * Returns the masking key defined in the WebSocket frame.
 * 
 * @param   {Buffer}    frame
 * @return  {Buffer}
 */
function getMasking(frame) {
    if (!frame || !isMasked(frame)) return;

    var length = getLength(frame);

    if (length < 126) {
        return frame.slice(2, 6);
    }
    if (length <= 0xFFFF) {
        return frame.slice(4, 8);
    }
    // maximum: 18446744073709551615
    if (length > 0xFFFF) {
        return frame.slice(10, 14);
    }    
}

/**
 * Return the payload defined in the WebSocket frame.
 * 
 * @param   {Buffer}    frame
 * @param   {Buffer}
 */
function getPayload(frame) {
    if (!frame) return;
    
    // TODO: actually use the length to get the payload
    // not automatically take the whole length of the rawFrame

    var length = getLength(frame);
    var offset = isMasked(frame) ? 4 : 0;

    if (length < 126) {
        return frame.slice(2 + offset);
    }
    if (length <= 0xFFFF) {
        return frame.slice(4 + offset);
    }
    if (length > 0xFFFF) {
        return frame.slice(10 + offset);
    }    
}

/**
 * Returns a websocket frame masking key.
 * 
 * @return  {Buffer}
 */
function createMask() {
    return crypto.randomBytes(4);
}

/**
 * Returns a websocket frame header.
 * 
 * TODO: support lengths above of 125
 * 
 * @param   {Boolean}   fin
 * @param   {Boolean}   mask
 * @param   {Number}    opcode
 * @param   {Number}    length
 * @return  {Buffer}
 */
function createHead(fin, mask, opcode, length) {
    var head = new Buffer(2);
    
    head[0] = opcode | ((fin) ? 0x80 : 0x00);
    head[1] = length | ((mask) ? 0x80 : 0x00);
    
    return head;
}

/**
 * Reads the bytes of a buffer of variable length as integer from right to left.
 * 
 * @param   {Buffer}    buffer
 * @param   {Number}
 */
function parseBufferAsInteger(buffer) {
    // TODO: improve this algorithm
    // - no two counters (digit, i)
    // - other loop (while?)
    // - find shorter name...
    var length = buffer.length;
    
    var int = buffer[length - 1];
    var digit = 1;
    
    for (var i = length - 1; i > 0; i--) {
        int += buffer[i - 1] * Math.pow(2, 8 * digit);
        digit++;
    }
    
    return int;
}

exports.mask = mask;
exports.unmask = mask;
exports.isFinal = isFinal;
exports.isMasked = isMasked;
exports.hasOpcode = hasOpcode;
exports.getOpcode = getOpcode;
exports.getLength = getLength;
exports.getMasking = getMasking;
exports.getPayload = getPayload;
exports.createMask = createMask;
exports.createHead = createHead;