var util = require('util');
var assert = require('assert');

var eachFrame = require('./mockup/frames');

var format = util.format;

describe('WebSocketFrame', function() {
    var WebSocketFrame = require('../lib/frame');

    describe('#isValid()', function() {
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            it(format('should return true on %s', name), function() {
                assert.strictEqual(true, wsFrame.isValid()); 
            });
        });
    });
    
    describe('#mapFrame()', function() {
        
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame();
            
            wsFrame.mapFrame(frame);
           
            it(format('should return %s for property fin on %s', fin, name), function() {
                assert.strictEqual(fin, wsFrame.fin); 
            });
            it(format('should return %s for property mask on %s', mask, name), function() {
                assert.strictEqual(mask, wsFrame.mask); 
            });
            it(format('should return %d for property opcode on %s', opcode, name), function() {
                assert.strictEqual(opcode, wsFrame.opcode); 
            });
            it(format('should return %d for property length on %s', length, name), function() {
                assert.strictEqual(length, wsFrame.length); 
            });
            
            it(format('should return %s for property masking on %s', masking.toString(), name), function() {
                assert.strictEqual(masking.toString(), wsFrame.masking.toString()); 
            }); 
            
            it(format('should return %s for property payload on %s', content, name), function() {
                assert.strictEqual(content, wsFrame.payload.toString()); 
            });
        });
    });
    
    describe('#toBuffer()', function() {
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var buildFrame = new WebSocketFrame();
            
            buildFrame.fin = fin;
            buildFrame.mask = mask;
            buildFrame.opcode = opcode;
            buildFrame.length = length;
            buildFrame.masking = masking;
            buildFrame.payload = new Buffer(content);
        
            var wsFrame = new WebSocketFrame(buildFrame.toBuffer());
            
            it(format('should return %s for property fin on %s', fin, name), function() {
                assert.strictEqual(fin, wsFrame.fin); 
            });
            it(format('should return %s for property mask on %s', mask, name), function() {
                assert.strictEqual(mask, wsFrame.mask); 
            });
            it(format('should return %d for property opcode on %s', opcode, name), function() {
                assert.strictEqual(opcode, wsFrame.opcode); 
            });
            it(format('should return %d for property length on %s', length, name), function() {
                assert.strictEqual(length, wsFrame.length); 
            });
            
            it(format('should return %s for property masking on %s', masking.toString(), name), function() {
                assert.strictEqual(masking.toString(), wsFrame.masking.toString()); 
            }); 
            
            it(format('should return %s for property payload on %s', content, name), function() {
                assert.strictEqual(content, wsFrame.payload.toString()); 
            });
        });
    });

});