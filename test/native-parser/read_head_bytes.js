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

    });

});
