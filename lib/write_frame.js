function WriteFrame() {
    this.fin = true;
    this.masked = false;

    this.opcode = 0x1;

    this.length = 0;
    this.payload = null;
}

WriteFrame.prototype.setFinal = function(bool) {
    this.fin = bool;
};

WriteFrame.prototype.setOpcode = function(hex) {
    this.opcode = hex;
};

WriteFrame.prototype.setLength = function(length) {
    this.length = length;
};

WriteFrame.prototype.setPayload = function(payload) {
    this.payload = payload;
};

WriteFrame.prototype.toBuffer = function() {
    var frameLength = 2 + this.length;

    var rawFrame = new Buffer(frameLength);

    rawFrame[0] = 0x80 | this.opcode;
    rawFrame[1] = this.length || this.payload.length;
    
    return Buffer.concat([rawFrame, this.payload]);
};

module.exports = WriteFrame;