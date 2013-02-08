var crypto = require('crypto');

/**
 * WebSocketFrame class.
 * 
 * The WebSocketFrame class can be used to map raw websocket frames to a readable
 * object state and to model custom frames which can be sent directly.
 * 
 * @param   {Buffer}
 */
function WebSocketFrame(frame) {
    if (frame) {
        this.mapFrame(frame);
    } else {
        this.fin = true;
        this.rsv1 = false;
        this.rsv2 = false;
        this.rsv3 = false;
        this.mask = false;
        
        this.opcode = 0x01;
        this.length = 0x00;
        
        this.payload = new Buffer(0);
    }
}

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

/**
 * Maps a frame buffer onto this object.
 * 
 * @param   {Buffer}    frame
 * @return  {WebSocketFrame}
 */
WebSocketFrame.prototype.mapFrame = function(frame) {
    if (!frame) return this;
    
    this.fin = Boolean(frame[0] & 0x80);
    this.rsv1 = Boolean(frame[0] & 0x40);
    this.rsv2 = Boolean(frame[0] & 0x20);
    this.rsv3 = Boolean(frame[0] & 0x10);
    this.mask = Boolean(frame[1] & 0x80);
    
    this.opcode = frame[0] & 0x0f;    
    this.length = frame[1] & 0x7f;
    
    var offset = 0;
    var maskingOffset = (this.mask) ? 4 : 0;
        
    if (this.length == 126) {
        offset = 2;
        this.length = frame.slice(2, 4).readUInt16BE(0);
    } else if (this.length == 127) {
        offset = 8;
        var lenBuf = frame.slice(2, 10);
        this.length = (lenBuf.readUInt32BE(0) << 8) + lenBuf.readUInt32BE(4);
    }
    
    this.masking = (this.mask) ? frame.slice(2 + offset, 6 + offset) : new Buffer(0);        
    this.payload = mask(this.masking, frame.slice(2 + offset + maskingOffset));
    
    return this;
};

/**
 * Converts the defined frame as buffer.
 * 
 * @return  {Buffer}
 */
WebSocketFrame.prototype.toBuffer = function() {
    var buffers = [];
    
    if (this.length > 125 && this.length <= 0xffff) {
        var lengthBuff = new Buffer(2);
        lengthBuff.writeUInt16BE(this.length, 0);
        this.length = 126;
    } else if (this.length > 0xffff) {
        var lengthBuff = new Buffer(8);
        lengthBuff.writeInt32BE(this.length, 4);
        this.length = 127;
    }
    
    var head = new Buffer(2);
    head[0] = ((this.fin) ? 0x80 : 0x00) | this.opcode;
    head[1] = ((this.mask) ? 0x80 : 0x00) | this.length;
    
    buffers.push(head);
    if (lengthBuff) buffers.push(lengthBuff);
    
    if (this.mask) {
        if (!this.masking) {
            this.masking = crypto.randomBytes(4);   
        }
        this.payload = mask(this.masking, this.payload);
        
        buffers.push(this.masking);
        buffers.push(this.payload);
    } else {
        buffers.push(this.payload);
    }

    return Buffer.concat(buffers);    
};


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

// export class as module
module.exports = WebSocketFrame;