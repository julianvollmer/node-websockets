var crypto = require('crypto');
var parser = require('./parser');

/**
 * WebSocket Frame helper.
 *
 * This class helps you build and read WebSocket frames.
 * You either pass in a rawFrame to map its byte sequence
 * to a readable state or pass nothing to set the flags, data
 * yourself over the api.
 *
 * TODOs:
 * - allow options hash or frame
 * - check fail safety of assignments
 * - create raw frame intime not on toBuffer()
 * 
 * @param   {Buffer}    frame
 */
function WebSocketFrame(frame) {
    this.frame = frame;
    
    this.last = parser.isFinal(frame) || true;
    this.masked = parser.isMasked(frame) || false;

    this.opcode = parser.getOpcode(frame) || 0x1;
    this.length = parser.getLength(frame) || 0x0;

    this.masking = parser.getMasking(frame) || null;
    this.payload = parser.getPayload(frame) || null;
}

/**
 * Returns true if fin flag set.
 *
 * @return  {Boolean}
 */
WebSocketFrame.prototype.isFinal = function() {

    return this.last;
};

/**
 * Sets fin flag to boolean.
 *
 * @param   {Boolean}   bool
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setFinal = function(bool) {
    this.last = bool;

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
 * Returns true if give opcode is equal to opcode in frame.
 * 
 * @param   {Number}    opcode
 * @return  {Boolean}
 */
WebSocketFrame.prototype.hasOpcode = function(opcode) {
    if (!opcode) return;
    
    return this.getOpcode() === opcode;
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
 * Returns masking key (creates one if not already done).
 *
 * @return  {Buffer}
 */
WebSocketFrame.prototype.getMasking = function() {
    if (!this.masking) {
        this.setMasking(crypto.randomBytes(4));
    }
    
    return this.masking;
};

/**
 * Sets the four masking bytes of a frame.
 */
WebSocketFrame.prototype.setMasking = function(bytes) {
    this.masking = bytes;
    
    return this;
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

    if (payload) {
        this.setLength(payload.length);
    }
    
    return this;  
};

/**
 * Returns decoded payload.
 *
 * @return  {Buffer}
 */
WebSocketFrame.prototype.getData = function() {
    if (this.isMasked()) {
        return parser.unmask(this.getMasking(), this.getPayload());
    }
    return this.getPayload();
};

/**
 * Encoded provided data to payload.
 * 
 * @param   {Buffer}    data
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.setData = function(data) {
    if (this.isMasked()) {
        data = parser.mask(this.getMasking(), data);
    }
    
    this.setPayload(data);

    return this;
};

/**
 * Transforms all attributes to raw frame buffer.
 *
 * @return  {Buffer}
 */
WebSocketFrame.prototype.toBuffer = function() {
    var head = new Buffer(2);

    head[0] = 0x80 | this.opcode;
    head[1] = this.length || this.payload.length;

    if (this.isMasked()) head[1] = head[1] | 0x80;

    var bufferList = [head];
    
    if (this.isMasked()) {
        bufferList.push(this.getMasking());
    }
    if (this.getPayload()) {
        bufferList.push(this.getPayload());
    }

    return Buffer.concat(bufferList);
};

module.exports = WebSocketFrame;