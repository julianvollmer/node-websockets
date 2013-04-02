var parser = require('../../lib/parser');

describe('WebSocketParser', function() {

    var state, chunk;

    beforeEach(function() {
        state = {};
        chunk = null;
    });

    describe('#readHeadBytes(state, chunk)', function() {
        
        it('should return fin true', function() {
            chunk = new Buffer([0x80, 0x00]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.true;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0x00);
        });

        it('should return mask true', function() {
            chunk = new Buffer([0x00, 0x80]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.true;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0x00);
        });

        it('should return rsv1 true', function() {
            chunk = new Buffer([0x40, 0x00]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.true;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0x00);
        });

        it('should return rsv2 true', function() {
            chunk = new Buffer([0x20, 0x00]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.true;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0x00);
        });

        it('should return rsv3 true', function() {
            chunk = new Buffer([0x10, 0x00]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.true;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0x00);
        });

        it('should return opcode 0x01', function() {
            chunk = new Buffer([0x01, 0x00]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x01);
            state.length.should.equal(0x00);
        });

        it('should return opcode 0x0a', function() {
            chunk = new Buffer([0x0a, 0x00]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x0a);
            state.length.should.equal(0x00);
        });

        it('should return length 125', function() {
            chunk = new Buffer([0x00, 0x7d]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0x7d);
        });

        it('should return length 126', function() {
            chunk = new Buffer([0x00, 0x7e, 0x00, 0x7e]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0x7e);
        });

        it('should return length 127', function() {
            chunk = new Buffer([0x00, 0x7e, 0x00, 0x7f]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0x7f);
        });

        it('should return length 65535', function() {
            chunk = new Buffer([0x00, 0x7e, 0xff, 0xff]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0xffff);
        });

        it('should return length 65536', function() {
            chunk = new Buffer([0x00, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0x10000);
        });

        it('should return length 4294967295', function() {
            chunk = new Buffer([0x00, 0x7f, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);
            parser.readHeadBytes(state, chunk);
            state.fin.should.be.false;
            state.mask.should.be.false;
            state.rsv1.should.be.false;
            state.rsv2.should.be.false;
            state.rsv3.should.be.false;
            state.opcode.should.equal(0x00);
            state.length.should.equal(0xffffffff);
        });

    });

});
