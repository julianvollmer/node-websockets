var util = require('util');

var mockupFrames = require('../mockup/frames');

var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var wsf;

    before(function() {
        wsf = new WebSocketFrame();
    });

    describe('#constructor([frame])', function() {
        // TODO: should be tested to act as alias to mapFrame  
        it('should have set default settings', function() {
            wsf.fin.should.be.true;
            wsf.rsv1.should.be.false;
            wsf.rsv2.should.be.false;
            wsf.rsv3.should.be.false;
            wsf.mask.should.be.false;
            wsf.glued.should.be.false;
            wsf.opcode.should.equal(0x01);
            wsf.length.should.equal(0x00);
            wsf.should.have.property('payload');
            wsf.should.have.property('masking');
            wsf.should.have.property('content');
            wsf.should.have.property('remnant');
        });
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
