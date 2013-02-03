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
    this.fin = prsr.isFinal(frame) || true;
    this.mask = prsr.isMasked(frame) || false;
    
    // second byte flags
    this.opcode = prsr.getOpcode(frame) || 0x01;
    this.length = prsr.getLength(frame) || 0x00;
    
    // other bytes containing data
    this.masking = prsr.getMasking(frame) || new Buffer(0);
    this.payload = prsr.getPayload(frame) || new Buffer(0);
}

/**
 * Returns true if frame has set fin flag.
 * 
 * @return  {Boolean}
 */
WebSocketFrame.prototype.isFinal = function() {
    return this.fin;
};

/**
 * Returns true if frame has set mask flag.
 * 
 * @return  {Boolean}
 */
WebSocketFrame.prototype.isMasked = function() {
    return this.mask;
};

/**
 * Returns the opcode as number from the frame.
 * 
 * @return  {Number}
 */
WebSocketFrame.prototype.getOpcode = function() {
    return this.opcode;
};

/**
 * Sets the opcode to a new number.
 * 
 * TODO: check if hex is in valid range
 * 
 * @param   {Number}    hex
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setOpcode = function(hex) {
    this.opcode = hex;
    
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
    if (!this.masking) {
        this.masking = prsr.createMask();
    }  
    
    return this.masking;
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
        payload = prsr.mask(this.getMasking, payload);
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
        frameBuffers.push(this.getPayload());
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

// export class as module
module.exports = WebSocketFrame;