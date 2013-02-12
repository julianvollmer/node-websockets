var util = require('util');
var should = require('should');

var mockupFrames = require('./mockup/frames');

var format = util.format;

describe('WebSocketFrame', function() {
    var WebSocketFrame = require('../lib/frame');

    describe('#isValid()', function() {
        
        mockupFrames.each(function(name, container) {
            var wsFrame = new WebSocketFrame(container.frame);
            
            it(format('should return true on %s', name), function() {
                wsFrame.isValid().should.be.true;
            });
        });
        
    });
    
    describe('#mapFrame()', function() {
        
        mockupFrames.each(function(name, container) {
            var wsFrame = new WebSocketFrame();
            
            wsFrame.mapFrame(container.frame);
           
            it(format('should return %s for property fin on %s', container.fin, name), function() {
                wsFrame.fin.should.be[container.fin];
            });
            it(format('should return %s for property mask on %s', container.mask, name), function() {
                wsFrame.mask.should.be[container.mask];
            });
            it(format('should return %d for property opcode on %s', container.opcode, name), function() {
                wsFrame.opcode.should.equal(container.opcode);
            });
            it(format('should return %d for property length on %s', container.length, name), function() {
                wsFrame.length.should.equal(container.length);
            });
            it(format('should return %s for property masking on %s', container.masking.toString(), name), function() {
                wsFrame.masking.toString().should.equal(container.masking.toString());
            }); 
            it(format('should return %s for property payload on %s', container.payload, name), function() {
                wsFrame.payload.toString().should.equal(container.payload.toString()); 
            });
            it(format('should return %s for property content on %s', container.content, name), function() {
                wsFrame.content.toString().should.equal(container.content.toString());
            });
        });
    });
    
    describe('#toBuffer()', function() {
        
        mockupFrames.each(function(name, container) {
            var buildFrame = new WebSocketFrame();
            
            buildFrame.fin = container.fin;
            buildFrame.mask = container.mask;
            buildFrame.opcode = container.opcode;
            buildFrame.length = container.length;
            buildFrame.masking = container.masking;
            buildFrame.payload = new Buffer(container.content);
        
            var wsFrame = new WebSocketFrame(buildFrame.toBuffer());
            
            it(format('should return %s for property fin on %s', container.fin, name), function() {
                wsFrame.fin.should.be[container.fin];
            });
            it(format('should return %s for property mask on %s', container.mask, name), function() {
                wsFrame.mask.should.be[container.mask];
            });
            it(format('should return %d for property opcode on %s', container.opcode, name), function() {
                wsFrame.opcode.should.equal(container.opcode);
            });
            it(format('should return %d for property length on %s', container.length, name), function() {
                wsFrame.length.should.equal(container.length);
            });
            it(format('should return %s for property masking on %s', container.masking.toString(), name), function() {
                wsFrame.masking.toString().should.equal(container.masking.toString());
            }); 
            it(format('should return %s for property payload on %s', container.content, name), function() {
                wsFrame.payload.toString().should.equal(container.payload.toString());
            });
        });
    
    });

});