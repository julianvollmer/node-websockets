var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var wsframe;

    beforeEach(function() {
        wsframe = new WebSocketFrame();
    });

    describe('#validate()', function() {
        
        it('should return an error on rsv1', function() {
            wsframe.rsv1 = true;
            wsframe.validate().should.be.an.instanceOf(Error);
        });

        it('should return an error on rsv2', function() {
            wsframe.rsv2 = true;
            wsframe.validate().should.be.an.instanceOf(Error);
        });

        it('should return an error on rsv3', function() {
            wsframe.rsv3 = true;
            wsframe.validate().should.be.an.instanceOf(Error);
        });

        it('should return an error on reserved opcode', function() {
            wsframe.opcode = 0x03;
            wsframe.validate().should.be.an.instanceOf(Error);
            wsframe.opcode = 0x04;
            wsframe.validate().should.be.an.instanceOf(Error);
            wsframe.opcode = 0x05;
            wsframe.validate().should.be.an.instanceOf(Error);
            wsframe.opcode = 0x06;
            wsframe.validate().should.be.an.instanceOf(Error);
            wsframe.opcode = 0x07;
            wsframe.validate().should.be.an.instanceOf(Error);
        });

    });

});
