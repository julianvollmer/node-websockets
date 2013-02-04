var WebSocketFrame = require('../lib/frame');

var frames = require('./mockup/frames');

function testSingleUnmaskedTextFrame() {
    var frame = new WebSocketFrame(frames.unmaskedTextFrame);
    
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

function testSingleMaskedTextFrame() {    
    var frame = new WebSocketFrame(frames.maskedTextFrame);
    
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

function testSingleUnmaskedPingFrame() {    
    var frame = new WebSocketFrame(frames.unmaskedPingFrame);
    
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

function testSingleMaskedPongFrame() {    
    var frame = new WebSocketFrame(frames.maskedPongFrame);
    
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

function testModeledSingleUnmaskedTextFrame() {    
    var frame = new WebSocketFrame();
    frame.setFinal(true);
    frame.setMasked(false);
    frame.setOpcode(0x01);
    frame.setPayload(new Buffer('Hello'));
    
    var controlFrame = new WebSocketFrame(frame.toBuffer());
    if (controlFrame.isFinal() === false) {
        console.log('final should be true', controlFrame.isFinal());
        
        return false;
    }
    if (controlFrame.isMasked() === true) {
        console.log('masked should be true', controlFrame.isMasked());
        
        return false;
    }
    if (controlFrame.getOpcode() !== 0x1) {
        console.log('opcode should be 0x1', controlFrame.getOpcode());
        
        return false;
    }
    if (controlFrame.getLength() !== 0x5) {
        console.log('length should be 0x5', controlFrame.getLength());
        
        return false;
    }
    if (controlFrame.getPayload().toString() !== 'Hello') {
        console.log('payload should be Hello', controlFrame.getPayload().toString());
        
        return false;
    }
    
    return true;
}

function testModeledSingleMaskedPingFrame() {    
    var frame = new WebSocketFrame();
    frame.setFinal(true);
    frame.setMasked(true);
    frame.setOpcode(0x09);
    frame.setPayload(new Buffer('Hello'));
    
    var controlFrame = new WebSocketFrame(frame.toBuffer());
    if (controlFrame.isFinal() === false) {
        console.log('final should be true', controlFrame.isFinal());
        
        return false;
    }
    if (controlFrame.isMasked() === false) {
        console.log('masked should be true', controlFrame.isMasked());
        
        return false;
    }
    if (controlFrame.getOpcode() !== 0x9) {
        console.log('opcode should be 0x9', controlFrame.getOpcode());
        
        return false;
    }
    if (controlFrame.getLength() !== 0x5) {
        console.log('length should be 0x5', controlFrame.getLength());
        
        return false;
    }
    if (controlFrame.getPayload().toString() !== 'Hello') {
        console.log('payload should be Hello', controlFrame.getPayload().toString());
        
        return false;
    }
    
    return true;
}

console.log('test single-frame unmasked text message: ', testSingleUnmaskedTextFrame());
console.log('test single-frame masked text message: ', testSingleMaskedTextFrame());
console.log('test single-frame unmasked ping request: ', testSingleUnmaskedPingFrame());
console.log('test single-frame masked pong response: ', testSingleMaskedPongFrame());
console.log('test modeled single-frame unmasked text message: ', testModeledSingleUnmaskedTextFrame());
console.log('test modeled single-frame masked ping request: ', testModeledSingleMaskedPingFrame());