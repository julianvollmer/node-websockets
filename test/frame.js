var assert = require('assert');

var frames = require('./mockup/frames');

describe('WebSocketFrame', function() {
    var WebSocketFrame = require('../lib/frame');
    
    describe('#isFinal()', function() {
        it('should return true as default', function() {
            assert.strictEqual(true, new WebSocketFrame().isFinal()); 
        });
        
        frames.allFrames.forEach(function(frame) {
            var wsFrame = new WebSocketFrame(frame.frame);
            
            it('should return ' + frame.fin + ' on ' + frame.name, function() {
                assert.strictEqual(frame.fin, wsFrame.isFinal());
            });
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
        it('should return false as default', function() {
            assert.strictEqual(false, new WebSocketFrame().isMasked()); 
        });
        
        frames.allFrames.forEach(function(frame) {
            var wsFrame = new WebSocketFrame(frame.frame);
            
            it('should return ' + frame.mask + ' on ' + frame.name, function() {
                assert.strictEqual(frame.mask, wsFrame.isMasked());
            });
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