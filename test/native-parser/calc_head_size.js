var parser = require('../../build/Release/parser');

describe('native WebSocketParser', function() {

    it('should throw error if argument not buffer or object', function() {
        (function() {
            parser.calcHeadSize([]);
        }).should.throwError();
        (function() {
            parser.calcHeadSize('hello');
        }).should.throwError();
    });

    describe('#calcHeadSize(chunk)', function() {

        it('should return two', function() {
            var head = new Buffer([0x82, 0x00]);
            
            parser.calcHeadSize(head).should.equal(2);
        });

        it('should return four', function() {
            var head = new Buffer([0x82, 0x7e, 0x00, 0x00]);
            
            parser.calcHeadSize(head).should.equal(4);
        });

        it('should return six', function() {
            var head = new Buffer([0x82, 0x80, 0x01, 0x02, 0x03, 0x04]);
            
            parser.calcHeadSize(head).should.equal(6);
        });

        it('should return eight', function() {
            var head = new Buffer([0x82, 0xfe, 0x00, 0x00, 0x01, 0x02, 0x03, 
                0x04]);
            
            parser.calcHeadSize(head).should.equal(8);
        });

        it('should return ten', function() {
            var head = new Buffer([0x82, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x00, 
                0x00, 0x00, 0x00]);
            
            parser.calcHeadSize(head).should.equal(10);
        });

        it('should return four-teen', function() {
            var head = new Buffer([0x82, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 
                0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04])
            
            parser.calcHeadSize(head).should.equal(14);
        });

        it('should throw error on buf.length < 2', function() {
            (function() {
                parser.calcHeadSize(new Buffer(1));
            }).should.throwError();
        });

    });

    describe('#calcHeadSize(state)', function() {

        it('should return two', function() {
            var stateOne = { length: 0 };
            var stateTwo = { length: 125 };
            
            parser.calcHeadSize(stateOne).should.equal(2);
            parser.calcHeadSize(stateTwo).should.equal(2);
        });

        it('should return four', function() {
            var stateOne = { length: 126 };
            var stateTwo = { length: 127, masking: new Buffer(2) };
            
            parser.calcHeadSize(stateOne).should.equal(4);
            parser.calcHeadSize(stateTwo).should.equal(4);
        });

        it('should return six', function() {
            var state = { length: 0, mask: true };
            
            parser.calcHeadSize(state).should.equal(6);
        });

        it('should return eight', function() {
            var state = { length: 0xffff, masking: new Buffer(4) };
            
            parser.calcHeadSize(state).should.equal(8);
        });

        it('should return ten', function() {
            var state = { length: 0x10000, masking: "buffer" };
            
            parser.calcHeadSize(state).should.equal(10);
        });

        it('should return four-teen', function() {
            var state = { length: 0xfffffff, masking: new Buffer(4) };
            
            parser.calcHeadSize(state).should.equal(14);
        });

        it('should throw error if state has no key length', function() {
            (function() {
                parser.calcHeadSize({});
            }).should.throwError();
        });

    });

});
