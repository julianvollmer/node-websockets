var WebSocketFrame = require('../lib/frame');

// a single-frame unmasked text message ("Hello")
function testSingleUnmaskedTextFrame() {
    var unmaskedTextFrame = new Buffer(7);
    unmaskedTextFrame[0] = 0x81;
    unmaskedTextFrame[1] = 0x05;
    unmaskedTextFrame[2] = 0x48;
    unmaskedTextFrame[3] = 0x65;
    unmaskedTextFrame[4] = 0x6c;
    unmaskedTextFrame[5] = 0x6c;
    unmaskedTextFrame[6] = 0x6f;

    var frame = new WebSocketFrame(unmaskedTextFrame);
    
    if (frame.isFinal() === false) {
        console.log('final should be true', frame.isFinal());
        
        return false;
    }
    if (frame.isMasked() === true) {
        console.log('masked should be false', frame.isMasked());
        
        return false;
    }
    if (frame.getOpcode() !== 0x1) {
        console.log('opcode should be 0x01', frame.getOpcode());
        
        return false;
    }
    if (frame.getLength() !== 0x05) {
        console.log('length should be 0x5', frame.getLength());
        
        return false;
    }
    if (frame.getPayload().toString() !== 'Hello') {
        console.log('payload should be Hello', frame.getPayload().toString());
        
        return false;
    }
    
    return true;
}

// a single-frame masked text message
function testSingleMaskedTextFrame() {
    var maskedTextFrame = new Buffer(11); 
    maskedTextFrame[0] = 0x81;
    maskedTextFrame[1] = 0x85;
    maskedTextFrame[2] = 0x37;
    maskedTextFrame[3] = 0xfa;
    maskedTextFrame[4] = 0x21;
    maskedTextFrame[5] = 0x3d;
    maskedTextFrame[6] = 0x7f;
    maskedTextFrame[7] = 0x9f;
    maskedTextFrame[8] = 0x4d;
    maskedTextFrame[9] = 0x51;
    maskedTextFrame[10] = 0x58;  
    
    var frame = new WebSocketFrame(maskedTextFrame);
    
    if (frame.isFinal() === false) {
        console.log('final should be true', frame.isFinal());
        
        return false;
    }
    if (frame.isMasked() === false) {
        console.log('masked should be true', frame.isMasked());
        
        return false;
    }
    if (frame.getOpcode() !== 0x1) {
        console.log('opcode should be 0x1', frame.getOpcode());
        
        return false;
    }
    if (frame.getLength() !== 0x5) {
        console.log('length should be 0x5', frame.getLength());
        
        return false;
    }
    if (frame.getPayload().toString() !== 'Hello') {
        console.log('payload should be Hello', frame.getPayload().toString(), frame.toString());
        
        return false;
    }
    
    return true;
}

// a single-frame unmasked ping request
function testSingleUnmaskedPingFrame() {
    var unmaskedPingFrame = new Buffer(7);
    unmaskedPingFrame[0] = 0x89;
    unmaskedPingFrame[1] = 0x05;
    unmaskedPingFrame[2] = 0x48;
    unmaskedPingFrame[3] = 0x65;
    unmaskedPingFrame[4] = 0x6c;
    unmaskedPingFrame[5] = 0x6c;
    unmaskedPingFrame[6] = 0x6f;
    
    var frame = new WebSocketFrame(unmaskedPingFrame);
    
    if (frame.isFinal() === false) {
        console.log('final should be true', frame.isFinal());
        
        return false;
    }
    if (frame.isMasked() === true) {
        console.log('masked should be false', frame.isMasked());
        
        return false;
    }
    if (frame.getOpcode() !== 0x9) {
        console.log('opcode should be 0x9', frame.getOpcode());
        
        return false;
    }
    if (frame.getLength() !== 0x5) {
        console.log('length should be 5', frame.getLength());
        
        return false;
    }
    if (frame.getPayload().toString() !== 'Hello') {
        console.log('payload should be Hello', frame.getPayload().toString());
        
        return false;
    }
    
    return true;
}

// a single-frame masked pong response
function testSingleMaskedPongFrame() {
    var maskedPongFrame = new Buffer(11);
    maskedPongFrame[0] = 0x8a;
    maskedPongFrame[1] = 0x85;
    maskedPongFrame[2] = 0x37;
    maskedPongFrame[3] = 0xfa;
    maskedPongFrame[4] = 0x21;
    maskedPongFrame[5] = 0x3d;
    maskedPongFrame[6] = 0x7f;
    maskedPongFrame[7] = 0x9f;
    maskedPongFrame[8] = 0x4d;
    maskedPongFrame[9] = 0x51;
    maskedPongFrame[10] = 0x58;    
    
    var frame = new WebSocketFrame(maskedPongFrame);
    
    if (frame.isFinal() === false) {
        console.log('final should be true', frame.isFinal());
        
        return false;
    }
    if (frame.isMasked() === false) {
        console.log('masked should be true', frame.isMasked());
        
        return false;
    }
    if (frame.getOpcode() !== 0xA) {
        console.log('opcode should be 0xA', frame.getOpcode());
        
        return false;
    }
    if (frame.getLength() !== 0x5) {
        console.log('length should be 0x5', frame.getLength());
        
        return false;
    }
    if (frame.getPayload().toString() !== 'Hello') {
        console.log('payload should be Hello', frame.getPayload().toString());
        
        return false;
    }
    
    return true;
}

console.log('test single-frame unmasked text message: ', testSingleUnmaskedTextFrame());
console.log('test single-frame masked text message: ', testSingleMaskedTextFrame());
console.log('test single-frame unmasked ping request: ', testSingleUnmaskedPingFrame());
console.log('test single-frame masked pong response: ', testSingleMaskedPongFrame());