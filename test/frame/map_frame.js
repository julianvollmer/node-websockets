var util = require('util');
var should = require('should');

var WebSocketFrame = require('../../lib/frame');
var mockupFrames = require('../mockup/frames');

var format = util.format;

describe('WebSocketFrame', function() {

    var wsFrame;

    beforeEach(function() {
        wsFrame = new WebSocketFrame();
    });

    describe('#mapFrame(frame)', function() {
        mockupFrames.each(function(name, mock) {
           
            it('should actually have such a method', function() {
                wsFrame.should.have.property('mapFrame').be.a('function');
            });
            
            it('should map the raw frame buffer properly to readable properties', function() {
                wsFrame.mapFrame(mock.frame);
                wsFrame.glued.should.be.false;
                wsFrame.should.have.property('fin', mock.fin, format('property fin is expected to be %s', mock.fin));
                wsFrame.should.have.property('mask', mock.mask, format('property mask is expected to be %s', mock.mask));
                wsFrame.should.have.property('opcode', mock.opcode, format('property opcode is expected to be %s', mock.opcode));
                wsFrame.should.have.property('length', mock.length, format('property length is expected to be %s', mock.length, name));
                wsFrame.masking.toString().should.equal(mock.masking.toString(), format('property masking is expected to be %s', mock.masking));
                wsFrame.payload.toString().should.equal(mock.payload.toString(), format('property payload is expected to be %s', mock.masking));
                wsFrame.content.toString().should.equal(mock.content.toString(), format('property content is expected to be %s', mock.masking));
            });
        
        });

        it('should handle glued frames properly', function() {
            var firstFrame = mockupFrames.maskedPingFrame;
            var secondFrame = mockupFrames.singleMaskedTextFrame;

            var gluedFrames = Buffer.concat([firstFrame.frame, secondFrame.frame]);

            wsFrame.mapFrame(gluedFrames);
            wsFrame.fin.should.be.true;
            wsFrame.rsv1.should.be.false;
            wsFrame.rsv2.should.be.false;
            wsFrame.rsv3.should.be.false;
            wsFrame.should.have.property('mask', firstFrame.mask);
            wsFrame.should.have.property('glued', true);
            wsFrame.should.have.property('opcode', firstFrame.opcode);
            wsFrame.should.have.property('length', firstFrame.length);
            wsFrame.content.toString().should.equal(firstFrame.content.toString());

            var secondWsFrame = new WebSocketFrame(wsFrame.remnant);
            secondWsFrame.fin.should.be.true;
            secondWsFrame.rsv1.should.be.false;
            secondWsFrame.rsv2.should.be.false;
            secondWsFrame.rsv3.should.be.false;
            secondWsFrame.should.have.property('mask', secondFrame.mask);
            secondWsFrame.should.have.property('glued', false);
            secondWsFrame.should.have.property('opcode', secondFrame.opcode);
            secondWsFrame.should.have.property('length', secondFrame.length);
            secondWsFrame.content.toString().should.equal(secondFrame.content.toString());
        });
    });
    
});
