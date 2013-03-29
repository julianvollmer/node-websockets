var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var frameOne, frameTwo, wsframe; 

    beforeEach(function() {
        frameOne = new Buffer([0x81, 0x03, 0x48]);
        frameTwo = new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]);
    });

    describe('#concat', function() {

        it('should concat the payload with given chunk', function() {
            wsframe = new WebSocketFrame(frameOne);
            wsframe.concat(new Buffer([0x65]));
            wsframe.concat(new Buffer([0x79]));
            wsframe.getContent().toString().should.equal('Hey');
        });

        it('should not concat the payload if already complete', function() {
            wsframe = new WebSocketFrame(frameTwo);
            wsframe.concat(new Buffer([0x65]));
            wsframe.concat(new Buffer([0x79]));
            wsframe.getContent().toString().should.equal('Hey');
        });

    });

});
