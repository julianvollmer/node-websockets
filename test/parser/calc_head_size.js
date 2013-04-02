var parser = require('../../lib/parser');

describe('WebSocketParser', function() {

    var state, chunk;

    beforeEach(function() {
        state = {};
        chunk = null;
    });

    describe('#calcHeadSize(state)', function() {
        
        it('should return two', function() {
            state.length = 0;
            parser.calcHeadSize(state).should.equal(2);
        });

        it('should return two', function() {
            state.length = 125;
            parser.calcHeadSize(state).should.equal(2);
        });

        it('should return two', function() {
            state.masking = new Buffer(0);
            parser.calcHeadSize(state).should.equal(2);
        });

        it('should return six', function() {
            state.mask = true;
            state.length = 0;
            parser.calcHeadSize(state).should.equal(6);
        });

        it('should return six', function() {
            state.length = 125;
            state.masking = new Buffer(4);
            parser.calcHeadSize(state).should.equal(6);
        });

        it('should return four', function() {
            state.length = 126;
            parser.calcHeadSize(state).should.equal(4);
        });

        it('should return four', function() {
            state.length = 127;
            parser.calcHeadSize(state).should.equal(4);
        });

        it('should return four', function() {
            state.length = 0xffff;
            parser.calcHeadSize(state).should.equal(4);
        });

        it('should return eight', function() {
            state.mask = true;
            state.length = 126;
            parser.calcHeadSize(state).should.equal(8);
        });

        it('should return eight', function() {
            state.length = 127;
            state.masking = new Buffer(4);
            parser.calcHeadSize(state).should.equal(8);
        });

        it('should return eight', function() {
            state.mask = true;    
            state.length = 0xffff;
            parser.calcHeadSize(state).should.equal(8);
        });

        it('should return ten', function() {
            state.length = 0x10000;
            parser.calcHeadSize(state).should.equal(10);
        });

        it('should return ten', function() {
            state.length = 0xffffff;
            parser.calcHeadSize(state).should.equal(10);
        });

        it('should return four-teen', function() {
            state.mask = true;
            state.length = 0x10000;
            parser.calcHeadSize(state).should.equal(14);
        });

        it('should return four-teen', function() {
            state.length = 0xffffff;
            state.masking = new Buffer(4);
            parser.calcHeadSize(state).should.equal(14);
        });

    });

    describe('#calcHeadSize(chunk)', function() {

        it('should return two', function() {
            chunk = new Buffer([0x82, 0x00]);
            parser.calcHeadSize(chunk).should.equal(2);
        });

        it('should return two', function() {
            chunk = new Buffer([0x00, 0x7d]);
            parser.calcHeadSize(chunk).should.equal(2);
        });

        it('should return six', function() {
            chunk = new Buffer([0x82, 0x80]);
            parser.calcHeadSize(chunk).should.equal(6);
        });

        it('should return six', function() {
            chunk = new Buffer([0x00, 0xfd]);
            parser.calcHeadSize(chunk).should.equal(6);
        });

        it('should return four', function() {
            chunk = new Buffer([0x01, 0x7e]);
            parser.calcHeadSize(chunk).should.equal(4);
        });

        it('should return eight', function() {
            chunk = new Buffer([0x01, 0xfe]);
            parser.calcHeadSize(chunk).should.equal(8);
        });

        it('should return ten', function() {
            chunk = new Buffer([0x80, 0x7f]);
            parser.calcHeadSize(chunk).should.equal(10);
        });
        
        it('should return four-teen', function() {
            chunk = new Buffer([0x80, 0xff]);
            parser.calcHeadSize(chunk).should.equal(14);
        });

    });

});
