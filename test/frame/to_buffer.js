var util = require('util');

var mockupFrames = require('../mockup/frames');

var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

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

            it(util.format('should return a buffer object for %s mockup frame', name), function() {
                buildFrame.toBuffer().should.be.an.instanceOf(Buffer);
            });
                
            it(util.format('should equal the %s mockup frame buffer', name), function() {
                wsFrame.mapFrame(buildFrame.toBuffer());
                wsFrame.should.have.property('fin', mock.fin, util.format('property fin is expected to be %s', mock.fin));
                wsFrame.should.have.property('mask', mock.mask, util.format('property mask is expected to be %s', mock.mask));
                wsFrame.should.have.property('opcode', mock.opcode, util.format('property opcode is expected to be %s', mock.opcode));
                wsFrame.should.have.property('length', mock.length, util.format('property length is expected to be %s', mock.length, name));
                wsFrame.masking.toString().should.equal(mock.masking.toString(), util.format('property masking is expected to be %s', mock.masking));
                wsFrame.payload.toString().should.equal(mock.payload.toString(), util.format('property payload is expected to be %s', mock.masking));
                wsFrame.content.toString().should.equal(mock.content.toString(), util.format('property content is expected to be %s', mock.masking));
            });

        });
    });
    
});
