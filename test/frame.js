var assert = require('assert');

var frames = require('./mockup/frames');

function eachFrame(callback) {
    frames.allFrames.forEach(callback);
}

describe('WebSocketFrame', function() {
    var WebSocketFrame = require('../lib/frame');
    
    describe('#isFinal()', function() {
        it('should return true as default', function() {
            assert.strictEqual(true, new WebSocketFrame().isFinal()); 
        });
        
        eachFrame(function(frame) {
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
        
        eachFrame(function(frame) {
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
    
    describe('#getOpcode()', function() {
        var frame = new WebSocketFrame();
        
        it('should return 0x1 as default opcode', function() {
            assert.strictEqual(0x1, frame.getOpcode()); 
        });
        
        eachFrame(function(frame) {
            var wsFrame = new WebSocketFrame(frame.frame);
            
            it('should equal ' + frame.opcode + ' on '+ frame.name, function() {
                assert.strictEqual(frame.opcode, wsFrame.getOpcode()); 
            });
        });
    });
    
    describe('#hasOpcode()', function() {
        eachFrame(function(frame) {
            var wsFrame = new WebSocketFrame(frame.frame);
            
            it('should return true when testing against right opcode on ' + frame.name, function() {
                assert.strictEqual(true, wsFrame.hasOpcode(frame.opcode)); 
            });
        });
    });
    
    describe('#setOpcode()', function() {
        var frame = new WebSocketFrame();
        
        for (var i = 0; i < 14; i++) {
            it('should set opcode to ' + i, function () {
                assert.strictEqual(i, frame.setOpcode(i).getOpcode());
            });
        }       
    });
    
    describe('#getLength()', function() {
        it('should return zero as default', function() {
            var wsFrame = new WebSocketFrame();
            
            assert.strictEqual(0, wsFrame.getLength()); 
        });
        
        eachFrame(function(frame) {
            var wsFrame = new WebSocketFrame(frame.frame);
            
            it('should return a length of ' + frame.length + ' on ' + frame.name, function() {
                assert.strictEqual(frame.length, wsFrame.getLength()); 
            });
        });
    });
    
    describe('#getMasking()', function() {
        eachFrame(function(frame) {
            var wsFrame = new WebSocketFrame(frame.frame);
            
            if (wsFrame.isMasked()) {
                it('should return a buffer object', function() {
                    assert.strictEqual(true, Buffer.isBuffer(wsFrame.getMasking()));
                });
            
                it('should return a buffer object with four bytes', function() {
                    assert.strictEqual(4, wsFrame.getMasking().length); 
                });
            
                it('should return a buffer which matches ' + frame.masking, function() {
                    assert.strictEqual(frame.masking.toString(), wsFrame.getMasking().toString()); 
                });   
            }
        });
    });
    
    describe('#getPayload()', function() {
        it('should return a empty buffer object at default', function() {
            var wsFrame = new WebSocketFrame();
            
            assert.strictEqual(true, Buffer.isBuffer(wsFrame.getPayload()));
            assert.strictEqual(0, wsFrame.getPayload().length);
        });
        
        eachFrame(function(frame) {
            var wsFrame = new WebSocketFrame(frame.frame);
            
            it('should return a buffer matching ' + frame.payload, function() {
                assert.strictEqual(frame.content, wsFrame.getPayload().toString()); 
            }); 
        });
    });
    
    describe('#setPayload()', function() {
        it('should set the payload properly', function() {
            var wsFrame = new WebSocketFrame();
        
            assert.strictEqual('Hello World', wsFrame.setPayload('Hello World').getPayload().toString()); 
        });
    });
    
    describe('#toBuffer()', function() {
        eachFrame(function(frame) {
            it('should equal the frame of ' + frame.name, function() {
                var wsFrame = new WebSocketFrame();
            
                wsFrame.setFinal(frame.fin);
                wsFrame.setMasked(frame.mask);
                wsFrame.setOpcode(frame.opcode);
            
                if (frame.mask) {
                    wsFrame.setMasking(frame.masking);
                }
            
                wsFrame.setPayload(new Buffer(frame.content));
            
                assert.strictEqual(frame.frame.toString(), wsFrame.toBuffer().toString()); 
            });
        });
    });
    
    describe('#toString()', function() {

    });

});