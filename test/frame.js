var assert = require('assert');

var frames = require('./mockup/frames');

describe('WebSocketFrame', function() {
    var WebSocketFrame = require('../lib/frame');
    
    var maskedCloseFrame        = new WebSocketFrame(frames.maskedCloseFrame);
    var unmaskedCloseFrame      = new WebSocketFrame(frames.unmaskedCloseFrame);
    var maskedPingFrame         = new WebSocketFrame(frames.maskedPingFrame);
    var unmaskedPingFrame       = new WebSocketFrame(frames.unmaskedPingFrame);
    var maskedPongFrame         = new WebSocketFrame(frames.maskedPongFrame);
    var unmaskedPongFrame       = new WebSocketFrame(frames.unmaskedPongFrame);
    var singleMaskedTextFrame   = new WebSocketFrame(frames.singleMaskedTextFrame);
    var singleUnmaskedTextFrame = new WebSocketFrame(frames.singleUnmaskedTextFrame);
    var firstFragmentedUnmaskedTextFrame    = new WebSocketFrame(frames.firstFragmentedUnmaskedTextFrame);
    var secondFragmentedUnmaskedTextFrame   = new WebSocketFrame(frames.secondFragmentedUnmaskedTextFrame);
    
    describe('#isFinal()', function() {
        it('should return true by all unfragmented frames', function() {
            assert.strictEqual(true, maskedCloseFrame.isFinal());
            assert.strictEqual(true, unmaskedCloseFrame.isFinal()); 
            assert.strictEqual(true, maskedPingFrame.isFinal());
            assert.strictEqual(true, unmaskedPingFrame.isFinal());
            assert.strictEqual(true, maskedPongFrame.isFinal());
            assert.strictEqual(true, unmaskedPongFrame.isFinal());
            assert.strictEqual(true, singleMaskedTextFrame.isFinal());
            assert.strictEqual(true, singleUnmaskedTextFrame.isFinal());
            assert.strictEqual(true, secondFragmentedUnmaskedTextFrame.isFinal());
        });
        
        it('should return false by continuation frames', function() {
            assert.strictEqual(false, firstFragmentedUnmaskedTextFrame.isFinal()); 
        });
    });
    
    describe('#setFinal()', function() {
        var frame = new WebSocketFrame();
        
        it('should set final state to true', function () {
            assert.strictEqual(true, frame.setFinal(true).isFinal());
        });
        
        it('should set final state to false', function() {
            assert.strictEqual(false, frame.setFinal(false).isFinal()); 
        });
    });
    
    describe('#isMasked()', function() {
        it('should return true by all masked frames', function() {
            assert.strictEqual(true, maskedCloseFrame.isMasked());
            assert.strictEqual(true, maskedPingFrame.isMasked());
            assert.strictEqual(true, maskedPongFrame.isMasked());
            assert.strictEqual(true, singleMaskedTextFrame.isMasked());
        });
        
        it('should return false by all unmasked frames', function() {
            assert.strictEqual(false, unmaskedCloseFrame.isMasked()); 
            assert.strictEqual(false, unmaskedPingFrame.isMasked());
            assert.strictEqual(false, unmaskedPongFrame.isMasked());
            assert.strictEqual(false, singleUnmaskedTextFrame.isMasked());
            assert.strictEqual(false, firstFragmentedUnmaskedTextFrame.isMasked());
            assert.strictEqual(false, secondFragmentedUnmaskedTextFrame.isMasked());
        });        
    });
    
    describe('#setMasked()', function() {
        var frame = new WebSocketFrame();
        
        it('should set masked state to true', function () {
            assert.strictEqual(true, frame.setMasked(true).isMasked());
        });
        
        it('should set masked state to false', function() {
            assert.strictEqual(false, frame.setMasked(false).isMasked()); 
        });        
    });
    
    describe('#hasOpcode()', function() {
        var frame = new WebSocketFrame();
        
        it('should return true if parameter equals frame opcode', function() {
            assert.strictEqual(true, frame.setOpcode(0x1).hasOpcode(0x1));
        });
        
        it('should return false if parameter does not equals frame opcode', function() {
            assert.strictEqual(false, frame.setOpcode(0x2).hasOpcode(0x8));    
        });
    });
    
    describe('#getOpcode()', function() {
        
    });
    
    describe('#setOpcode()', function() {
        
    });
    
    describe('#getLength()', function() {
        
    });
    
    describe('#getMasking()', function() {
        
    });
    
    describe('#getPayload()', function() {
        
    });
    
    describe('#setPayload()', function() {
        
    });
    
    describe('#toBuffer()', function() {
        
    });
    
    describe('#toString()', function() {
        
    });

});