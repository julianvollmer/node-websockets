var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var wsframe, frameOne, frameTwo;

    beforeEach(function() {
        frameOne = new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
        frameTwo = new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]);
    });

    describe('#getContent()', function() {

        it('should return the payload of a unmasked frame', function() {
            wsframe = new WebSocketFrame(frameOne);
            wsframe.getContent().toString().should.equal('Hello');
        });

        it('should return the decoded payload of a maasked frame', function() {
            wsframe = new WebSocketFrame(frameTwo);
            wsframe.getContent().toString().should.equal('Hello');
        });

    });

    describe('#setContent(buf)', function() {

        beforeEach(function() {
            wsframe = new WebSocketFrame();
        });

        it('should create a masking if not already done', function() {
            var masking = wsframe.masking;
            wsframe.mask = true;
            wsframe.setContent(new Buffer('Hello'));
            wsframe.masking.toString().should.not.equal(masking.toString());
        });

        it('should not create a masking if mask is false', function() {
            wsframe.setContent(new Buffer('Hello'));
            wsframe.masking.length.should.equal(0);
        });

        it('should not overwrite a masking if already existent', function() {
            var masking = new Buffer([0x3e, 0x6f, 0xf1, 0x05]);
            wsframe.mask = true;
            wsframe.masking = masking;
            wsframe.setContent(new Buffer('Hello'));
            wsframe.masking.toString().should.equal(masking.toString());
        });

        it('should update length and set payload to content if mask false', function() {
            wsframe.mask = false;
            wsframe.setContent(new Buffer('Hello'));
            wsframe.length.should.equal(0x05);
            wsframe.masking.length.should.equal(0x00);
            wsframe.payload.toString().should.equal('Hello');
        });

        it('should update length and set payload to masked content if mask true', function() {
            wsframe.mask = true;
            wsframe.setContent(new Buffer('Hello'));
            wsframe.length.should.equal(0x05);
            wsframe.masking.length.should.equal(0x04);
            wsframe.payload.length.should.equal(0x05);
            wsframe.getContent().toString().should.equal('Hello');
        });

    });

});
