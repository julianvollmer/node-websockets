var parser = require('../../build/Release/parser');

describe('WebSocketParser (native)', function() {

    describe('#calcHeadSize(buf)', function() {

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

    });

});
