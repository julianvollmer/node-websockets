var parser = require('../../build/Release/parser');

describe('native WebSockeParser', function() {

    var stateOne, stateTwo;

    beforeEach(function() {
        stateOne = {};
        stateTwo = {};
    });

    describe('#readHeadBytes(state, head)', function() {

        it('should set fin on state hash', function() {
            parser.readHeadBytes(stateOne, new Buffer([0x80, 0x00]));
            parser.readHeadBytes(stateTwo, new Buffer([0x00, 0x00]));

            stateOne.should.have.property('fin', true);
            stateTwo.should.have.property('fin', false);
        });

        it('should set rsv1 on state hash', function() {
            parser.readHeadBytes(stateOne, new Buffer([0x40, 0x00]));
            parser.readHeadBytes(stateTwo, new Buffer([0x00, 0x00]));

            stateOne.should.have.property('rsv1', true);
            stateTwo.should.have.property('rsv1', false);
        });

        it('should set rsv2 on state hash', function() {
            parser.readHeadBytes(stateOne, new Buffer([0x20, 0x00]));
            parser.readHeadBytes(stateTwo, new Buffer([0x00, 0x00]));

            stateOne.should.have.property('rsv2', true);
            stateTwo.should.have.property('rsv2', false);
        });

        it('should set rsv3 on state hash', function() {
            parser.readHeadBytes(stateOne, new Buffer([0x10, 0x00]));
            parser.readHeadBytes(stateTwo, new Buffer([0x00, 0x00]));

            stateOne.should.have.property('rsv3', true);
            stateTwo.should.have.property('rsv3', false);
        });

        it('should set mask on state hash', function() {
            parser.readHeadBytes(stateOne, new Buffer([0x00, 0x80]));
            parser.readHeadBytes(stateTwo, new Buffer([0x00, 0x00]));

            stateOne.should.have.property('mask', true);
            stateTwo.should.have.property('mask', false);
        });

        it('should set length < 126 on state hash', function() {
            parser.readHeadBytes(stateOne, new Buffer([0x00, 0x00]));
            parser.readHeadBytes(stateTwo, new Buffer([0x00, 0x7d]));

            stateOne.should.have.property('length', 0x00);
            stateTwo.should.have.property('length', 0x7d);
        });

        it('should set length < 65356 on state hash', function() {
            var stateThree = {};
            parser.readHeadBytes(stateOne, new Buffer([0x00, 0x7e, 0x00, 0x7e]));
            parser.readHeadBytes(stateTwo, new Buffer([0x00, 0x7e, 0x00, 0x7f]));
            parser.readHeadBytes(stateThree, new Buffer([0x00, 0x7e, 0xff, 0xff]));

            stateOne.should.have.property('length', 0x7e);
            stateTwo.should.have.property('length', 0x7f);
            stateThree.should.have.property('length', 0xffff);
        });

        it('should set length > 65355 on state hash', function() {
            parser.readHeadBytes(stateOne, new Buffer([0x00, 0x7f, 0x00, 
                    0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]));
            parser.readHeadBytes(stateTwo, new Buffer([0x00, 0x7f, 0x00, 
                    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]));

            stateOne.should.have.property('length', 0x10000);
            stateTwo.should.have.property('length', 0x1000000);
        });

        it('should through error if length > 0xfffffff', function() {
            (function() {
                parser.readHeadBytes({}, new Buffer([0x00, 0x7f, 0x00, 
                        0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00]));
            }).should.throwError();
        });

        it('should set masking to empty buffer if not masked', function() {
            parser.readHeadBytes(stateOne, new Buffer([0x00, 0x00]));

            stateOne.masking.should.have.eql(new Buffer(0));
        });

    });

});
