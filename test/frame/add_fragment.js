var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var wsframe, wsframeOne, wsframeTwo;

    beforeEach(function() {
        wsframe = new WebSocketFrame(new Buffer([0x01, 0x81, 0x3f, 0x6f, 0xc8, 0xb0, 0x77]));
        wsframeOne = new WebSocketFrame(new Buffer([0x01, 0x81, 0x0c, 0xd6, 0xbe, 0xc5, 0x69]));
        wsframeTwo = new WebSocketFrame(new Buffer([0x81, 0x81, 0x23, 0xe1, 0x67, 0x1e, 0x5a]));
    });

    describe('#addFragment(wsframe)', function() {

        it('should add the frame to the internal storage', function() {
            wsframe.addFragment(wsframeOne);
            wsframe.addFragment(wsframeTwo);
            wsframe.fragments.should.include(wsframeOne);
            wsframe.fragments.should.include(wsframeTwo);
        });

        it('should reject the frame if already fin', function() {
            wsframe.fin = true;
            wsframe.addFragment(wsframeOne);
            wsframe.fragments.length.should.equal(0x00);
        });

    });

    describe('#getContent()', function() {

        it('should return the concated payload of all fragments', function() {
            wsframe.addFragment(wsframeOne);
            wsframe.addFragment(wsframeTwo);
            wsframe.getContent().toString().should.equal('Hey');
        });

    });

});
