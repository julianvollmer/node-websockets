var util = require('util');
var should = require('should');

var WebSocketFrame = require('../../lib/frame');
var mockupFrames = require('../mockup/frames');

var format = util.format;

describe('WebSocketFrame', function() {

    xdescribe('#constructor([frame])', function() {
        // should be tested to act as alias to mapFrame   
    });

    describe('#mapFrame(frame)', function() {
        mockupFrames.each(function(name, mock) {
            
            var wsFrame;

            beforeEach(function() {
                wsFrame = new WebSocketFrame();
            });
            
            it('should actually have such a method', function() {
                wsFrame.should.have.property('mapFrame').be.a('function');
            });
            
            it('should map the raw frame buffer properly to readable properties', function() {
                wsFrame.mapFrame(mock.frame);
                wsFrame.should.have.property('fin', mock.fin, format('property fin is expected to be %s', mock.fin));
                wsFrame.should.have.property('mask', mock.mask, format('property mask is expected to be %s', mock.mask));
                wsFrame.should.have.property('opcode', mock.opcode, format('property opcode is expected to be %s', mock.opcode));
                wsFrame.should.have.property('length', mock.length, format('property length is expected to be %s', mock.length, name));
                wsFrame.masking.toString().should.equal(mock.masking.toString(), format('property masking is expected to be %s', mock.masking));
                wsFrame.payload.toString().should.equal(mock.payload.toString(), format('property payload is expected to be %s', mock.masking));
                wsFrame.content.toString().should.equal(mock.content.toString(), format('property content is expected to be %s', mock.masking));
            });
        
        });
    });
    
    describe('#toBuffer()', function() {
        mockupFrames.each(function(name, mock) {
            
            var wsFrame, buildFrame;

            beforeEach(function() {
                wsFrame = new WebSocketFrame();
                buildFrame = new WebSocketFrame();
                buildFrame.fin = mock.fin;
                buildFrame.mask = mock.mask;
                buildFrame.opcode = mock.opcode;
                buildFrame.length = mock.length;
                buildFrame.masking = mock.masking;
                buildFrame.content = mock.content;
            });

            it(format('should return a buffer object for %s mockup frame', name), function() {
                buildFrame.toBuffer().should.be.an.instanceOf(Buffer);
            });
                
            it(format('should equal the %s mockup frame buffer', name), function() {
                wsFrame.mapFrame(buildFrame.toBuffer());
                wsFrame.should.have.property('fin', mock.fin, format('property fin is expected to be %s', mock.fin));
                wsFrame.should.have.property('mask', mock.mask, format('property mask is expected to be %s', mock.mask));
                wsFrame.should.have.property('opcode', mock.opcode, format('property opcode is expected to be %s', mock.opcode));
                wsFrame.should.have.property('length', mock.length, format('property length is expected to be %s', mock.length, name));
                wsFrame.masking.toString().should.equal(mock.masking.toString(), format('property masking is expected to be %s', mock.masking));
                wsFrame.payload.toString().should.equal(mock.payload.toString(), format('property payload is expected to be %s', mock.masking));
                wsFrame.content.toString().should.equal(mock.content.toString(), format('property content is expected to be %s', mock.masking));
            });
        });
    });

});
