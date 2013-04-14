var parser = require('../../build/Release/parser');

describe('native WebSocketParser', function() {

    var stateOne, stateTwo, headOne, headTwo, chunkOne, chunkTwo;

    beforeEach(function() {
        stateOne = {};
        stateTwo = {};
    });

    describe('#writeHeadBytes(state)', function() {
 
        it('should set fin flag', function() {
            stateOne.fin = true;
            stateTwo.fin = false;

            headOne = new Buffer([0x80, 0x00]);
            headTwo = new Buffer([0x00, 0x00]);

            parser.writeHeadBytes(stateOne).should.eql(headOne);
            parser.writeHeadBytes(stateTwo).should.eql(headTwo);
        });
 
        it('should set mask flag', function() {
            stateOne.mask = true;
            stateTwo.mask = false;

            headOne = new Buffer([0x00, 0x80]);
            headTwo = new Buffer([0x00, 0x00]);

            chunkOne = parser.writeHeadBytes(stateOne);
            chunkTwo = parser.writeHeadBytes(stateTwo);

            chunkOne.slice(0, 2).should.eql(headOne);
            chunkOne.length.should.equal(6);
            chunkTwo.slice(0, 2).should.eql(headTwo);
            chunkTwo.length.should.equal(2);
        });

        it('should set opcode', function() {
            stateOne.opcode = 0x00;
            stateTwo.opcode = 0x0a;

            headOne = new Buffer([0x00, 0x00]);
            headTwo = new Buffer([0x0a, 0x00]);

            chunkOne = parser.writeHeadBytes(stateOne);
            chunkTwo = parser.writeHeadBytes(stateTwo);

            chunkOne.should.eql(headOne);
            chunkTwo.should.eql(headTwo);
        });

        it('should set length < 126', function() {
            stateOne.length = 0;
            stateTwo.length = 125;

            headOne = new Buffer([0x00, 0x00]);
            headTwo = new Buffer([0x00, 0x7d]);

            chunkOne = parser.writeHeadBytes(stateOne);
            chunkTwo = parser.writeHeadBytes(stateTwo);

            chunkOne.should.eql(headOne);
            chunkTwo.should.eql(headTwo);
        });

        it('should set 125 < length > 65355', function() {
            stateOne.length = 126;
            stateTwo.length = 127;
            var stateThree = { length: 0xffff };

            headOne = new Buffer([0x00, 0x7e, 0x00, 0x7e]);
            headTwo = new Buffer([0x00, 0x7e, 0x00, 0x7f]);
            var headThree = new Buffer([0x00, 0x7e, 0xff, 0xff]);

            chunkOne = parser.writeHeadBytes(stateOne);
            chunkTwo = parser.writeHeadBytes(stateTwo);
            var chunkThree = parser.writeHeadBytes(stateThree);

            chunkOne.should.eql(headOne);
            chunkTwo.should.eql(headTwo);
            chunkThree.should.eql(headThree);
        });

        it('should set 65355 < length > 4294967295', function() {
            stateOne.length = 0x10000;
            stateTwo.length = 0xfffffff;

            headOne = new Buffer([0x00, 0x7f, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x01, 0x00, 0x00]);
            headTwo = new Buffer([0x00, 0x7f, 0x00, 0x00, 0x00, 0x00,
                0x0f, 0xff, 0xff, 0xff]);

            chunkOne = parser.writeHeadBytes(stateOne);
            chunkTwo = parser.writeHeadBytes(stateTwo);

            chunkOne.should.eql(headOne);
            chunkTwo.should.eql(headTwo);
        });

        it('should set masking', function() {
            var masking = new Buffer([0x43, 0xbe, 0x07, 0xf1]);
            stateOne.masking = masking;
            
            headOne = new Buffer([0x00, 0x80]);
            
            chunkOne = parser.writeHeadBytes(stateOne);

            chunkOne.should.eql(Buffer.concat([headOne, masking]));
        });

    });

});
