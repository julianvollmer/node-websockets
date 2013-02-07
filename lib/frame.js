var WebSocketHelper = require('./helper');

// shortcut to parser methods
var prsr = WebSocketHelper.parser;

/**
 * WebSocketFrame class.
 * 
 * The WebSocketFrame class can be used to map raw websocket frames to a readable
 * object state and to model custom frames which can be sent directly.
 * 
 * @param   {Buffer}
 */
function WebSocketFrame(frame) {    
    this.frame = frame;
    
    // first byte flags
    this.fin = (frame) ? Boolean(frame[0] & 0x80) : true;
    this.rsv1 = (frame) ? Boolean(frame[0] & 0x40) : false;
    this.rsv2 = (frame) ? Boolean(frame[0] & 0x20) : false;
    this.rsv3 = (frame) ? Boolean(frame[0] & 0x10) : false;
    
    this.mask = prsr.isMasked(frame);
    
    // second byte flags
    this.opcode = prsr.getOpcode(frame);
    this.length = prsr.getLength(frame) | 0;
    
    // other bytes containing data
    this.masking = prsr.getMasking(frame) || new Buffer(0);
    this.payload = prsr.getPayload(frame) || new Buffer(0);
    
    this.frameLength = (frame) ? frame.length : 0;
}

/**
 * Returns true if frame has set fin flag.
 * 
 * @return  {Boolean}
 */
WebSocketFrame.prototype.isFinal = function() {
    if (this.fin === undefined) {
        return true;
    }
    return this.fin;
};

/**
 * Sets the fin flag of a frame to bool.
 * 
 * @param   {Boolean}   bool
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setFinal = function(bool) {
    this.fin = Boolean(bool);
    
    return this;
};

/**
 * Returns true if frame has set mask flag.
 * 
 * @return  {Boolean}
 */
WebSocketFrame.prototype.isMasked = function() {
    if (this.mask === undefined) {
        return false;
    }
    return this.mask;
};

/**
 * Sets the mask flag of a frame to bool.
 * 
 * @param   {Boolean}   bool
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setMasked = function(bool) {
    this.mask = Boolean(bool);
    
    return this;
};

/**
 * Shortcut for testing opcode against a number.
 * 
 * @param   {Number}    code
 * @return  {Boolean}
 */
WebSocketFrame.prototype.hasOpcode = function(code) {
    return this.getOpcode() === code;  
};

/**
 * Returns the opcode as number from the frame.
 * 
 * @return  {Number}
 */
WebSocketFrame.prototype.getOpcode = function() {
    if (this.opcode === undefined) {
        this.opcode = 0x01;
    }
    
    return this.opcode;
};

/**
 * Sets the opcode to a new number.
 * 
 * TODO: check if hex is in valid range
 * 
 * @param   {Number}    code
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setOpcode = function(code) {
    this.opcode = code;
    
    return this;
};

/**
 * Returns the size of the payload in bytes.
 * 
 * @return  {Number}
 */
WebSocketFrame.prototype.getLength = function() {
    return this.length;
};

/**
 * Returns the four byte big masking key.
 * 
 * This method will create one if no one is defined but required.
 * 
 * @return  {Buffer}
 */
WebSocketFrame.prototype.getMasking = function() {
    if (this.mask && !this.masking) {
        this.masking = prsr.createMask();
    }
    
    return this.masking;
};

WebSocketFrame.prototype.setMasking = function(buff) {
    if (!Buffer.isBuffer(buff) || buff.length !== 4) {
        buff = prsr.createMask();
    } 
    
    this.masking = buff;
    
    return this;
};

/**
 * Returns the encoded frame payload.
 * 
 * This method will automatically unmask the payload.
 * 
 * @return  {Buffer}
 */
WebSocketFrame.prototype.getPayload = function() {
    if (this.isMasked()) {
        return prsr.unmask(this.getMasking(), this.payload);
    }  
    
    return this.payload;
};

/**
 * Set the frame payload to buffer.
 * 
 * This method will automatically set length.
 * 
 * @param   {Buffer}    payload
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setPayload = function(payload) {
    if (this.isMasked()) {
        payload = prsr.mask(this.getMasking(), payload);
    }
    
    this.length = payload.length;
    this.payload = payload;
    
    return this;
};

/**
 * Converts the defined frame as buffer.
 * 
 * @return  {Buffer}
 */
WebSocketFrame.prototype.toBuffer = function() {
    var fin = this.isFinal();
    var mask = this.isMasked();
    var opcode = this.getOpcode();
    var length = this.getLength();
    
    var frameBuffers = [prsr.createHead(fin, mask, opcode, length)];
    
    if (this.isMasked()) {
        frameBuffers.push(this.getMasking());
    }
    if (this.getPayload()) {
        // using getPayload() would return a unmasked buffer
        frameBuffers.push(this.payload);
    }

    return Buffer.concat(frameBuffers);    
};

/**
 * Returns the defined frame as string.
 * 
 * @return  {String}
 */ 
WebSocketFrame.prototype.toString = function() {
    var str = '';
    
    str += 'final: ' + this.fin + ', ';
    str += 'masked: ' + this.mask + ', ';
    
    str += 'opcode: ' + this.opcode + ', ';
    str += 'length: ' + this.length + ', ';
    
    str += 'masking: ' + this.masking + ', ';
    str += 'payload: ' + this.payload + ', ';
    
    return str;
};

/**
 * Returns true if websocket frame is valid after rfc 6455.
 * 
 * @return  {Boolean}
 */
WebSocketFrame.prototype.isValid = function() {
    // reserved bits are not allowed to be true
    if (this.rsv1) {
        return false;
    }
    if (this.rsv2) {
        return false;
    }
    if (this.rsv3) {
        return false;
    }
    
    // reserved opcodes are not allowed to be used
    if (this.opcode == 0x03) {
        return false;
    }
    if (this.opcode == 0x04) {
        return false;
    }
    if (this.opcode == 0x05) {
        return false;
    }
    if (this.opcode == 0x06) {
        return false;
    }
    if (this.opcode == 0x07) {
        return false;
    }
    
    // following lengths are not possible
    if (this.frameLength < 2) {
        return false;
    }
    if (this.mask && this.frameLength < 8) {
        return false;
    }
    // TODO: check if payload length works with frame length + head
    
    return true;
};

// export class as module
module.exports = WebSocketFrame;