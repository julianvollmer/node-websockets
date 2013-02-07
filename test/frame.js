var util = require('util');
var assert = require('assert');

var eachFrame = require('./mockup/frames');

var format = util.format;

describe('WebSocketFrame', function() {
    var WebSocketFrame = require('../lib/frame');
    
    describe('#isFinal()', function() {
        it('should return true as default', function() {
            assert.strictEqual(true, new WebSocketFrame().isFinal()); 
        });
        
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            it(format('should return %s on %s', fin, name), function() {
                assert.strictEqual(fin, wsFrame.isFinal());
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
        
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            it(format('should return %s on %s', mask, name), function() {
                assert.strictEqual(mask, wsFrame.isMasked());
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
        
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            it(format('should equal %d on %s', opcode, name), function() {
                assert.strictEqual(opcode, wsFrame.getOpcode()); 
            });
        });
    });
    
    describe('#hasOpcode()', function() {
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            it(format('should return true when testing against opcode %d on %s', opcode, name), function() {
                assert.strictEqual(true, wsFrame.hasOpcode(opcode));
            });
        });
    });
    
    describe('#setOpcode()', function() {
        var frame = new WebSocketFrame();
        
        for (var i = 0; i < 14; i++) {
            it(format('should set opcode to %d', i), function () {
                assert.strictEqual(i, frame.setOpcode(i).getOpcode());
            });
        }       
    });
    
    describe('#getLength()', function() {
        it('should return zero as default', function() {
            var wsFrame = new WebSocketFrame();
            
            assert.strictEqual(0, wsFrame.getLength()); 
        });
        
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            it(format('should return a length of %d on %s', length, name), function() {
                assert.strictEqual(length, wsFrame.getLength()); 
            });
        });
    });
    
    describe('#getMasking()', function() {
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            if (wsFrame.isMasked()) {
                it('should return a buffer object', function() {
                    assert.strictEqual(true, Buffer.isBuffer(wsFrame.getMasking()));
                });
            
                it('should return a buffer object with four bytes', function() {
                    assert.strictEqual(4, wsFrame.getMasking().length); 
                });
            
                it('should return a buffer which matches ' + masking, function() {
                    assert.strictEqual(masking.toString(), wsFrame.getMasking().toString()); 
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
        
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            it(format('should return a buffer matching encoded %s on %s', content, name), function() {
                assert.strictEqual(content, wsFrame.getPayload().toString()); 
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
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            it(format('should equal the frame of %s', name), function() {
                var wsFrame = new WebSocketFrame();
            
                wsFrame.setFinal(fin);
                wsFrame.setMasked(mask);
                wsFrame.setOpcode(opcode);
            
                if (mask) {
                    wsFrame.setMasking(masking);
                }
            
                wsFrame.setPayload(new Buffer(content));
            
                assert.strictEqual(frame.toString(), wsFrame.toBuffer().toString()); 
            });
        });
    });
    
    describe('#toString()', function() {
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            it(format('should return a string on %s', name), function() {
               assert.strictEqual('string', typeof new WebSocketFrame(frame).toString()); 
            });
        });
    });
    
    describe('#isValid()', function() {
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            it(format('should return true on %s', name), function() {
                assert.strictEqual(true, wsFrame.isValid()); 
            });
        });
    });

});