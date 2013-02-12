var util = require('util');
var should = require('should');

var eachFrame = require('./mockup/frames');

var format = util.format;

describe('WebSocketFrame', function() {
    var WebSocketFrame = require('../lib/frame');

    describe('#isValid()', function() {
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame(frame);
            
            it(format('should return true on %s', name), function() {
                wsFrame.isValid().should.be.true;
            });
        });
    });
    
    describe('#mapFrame()', function() {
        
        eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
            var wsFrame = new WebSocketFrame();
            
            wsFrame.mapFrame(frame);
           
            it(format('should return %s for property fin on %s', fin, name), function() {
                wsFrame.fin.should.be[fin];
            });
            it(format('should return %s for property mask on %s', mask, name), function() {
                wsFrame.mask.should.be[mask];
            });
            it(format('should return %d for property opcode on %s', opcode, name), function() {
                wsFrame.opcode.should.equal(opcode);
            });
            it(format('should return %d for property length on %s', length, name), function() {
                wsFrame.length.should.equal(length);
            });
            it(format('should return %s for property masking on %s', masking.toString(), name), function() {
                wsFrame.masking.toString().should.equal(masking.toString());
            }); 
            it(format('should return %s for property payload on %s', content, name), function() {
                wsFrame.payload.toString().should.equal(content);
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
                wsFrame.fin.should.be[fin];
            });
            it(format('should return %s for property mask on %s', mask, name), function() {
                wsFrame.mask.should.be[mask];
            });
            it(format('should return %d for property opcode on %s', opcode, name), function() {
                wsFrame.opcode.should.equal(opcode);
            });
            it(format('should return %d for property length on %s', length, name), function() {
                wsFrame.length.should.equal(length);
            });
            it(format('should return %s for property masking on %s', masking.toString(), name), function() {
                wsFrame.masking.toString().should.equal(masking.toString());
            }); 
            it(format('should return %s for property payload on %s', content, name), function() {
                wsFrame.payload.toString().should.equal(content);
            });
        });
    });

});