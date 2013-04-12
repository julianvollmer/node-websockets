var MockupSocket = require('../mockup/socket');
var WebSocket = require('../../lib/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    it('should close connection on rsv1', function(done) {
        var counter = 0;
        msocket.on('data', function(chunk) {
            closeFrame(counter, chunk, done);
            counter++;
        });

        msocket.push(new Buffer([0xc1, 0x00]));
    });

    it('should close connection on rsv2', function(done) {
        var counter = 0;
        msocket.on('data', function(chunk) {
            closeFrame(counter, chunk, done);
            counter++;
        });

        msocket.push(new Buffer([0xa1, 0x00]));
    });

    it('should close connection on rsv3', function(done) {
        var counter = 0;
        msocket.on('data', function(chunk) {
            closeFrame(counter, chunk, done);
            counter++;
        });

        msocket.push(new Buffer([0x91, 0x00]));
    });

    it('should close connection on invalid opcode (0x04)', function(done) {
        var counter = 0;
        msocket.on('data', function(chunk) {
            closeFrame(counter, chunk, done);
            counter++;
        });

        msocket.push(new Buffer([0x84, 0x00]));
    });

    it('should close connection on invalid opcode (0x07)', function(done) {
        var counter = 0;
        msocket.on('data', function(chunk) {
            closeFrame(counter, chunk, done);
            counter++;
        });

        msocket.push(new Buffer([0x87, 0x00]));
    });

    it('should close connection on invalid opcode (0x0b)', function(done) {
        var counter = 0;
        msocket.on('data', function(chunk) {
            closeFrame(counter, chunk, done);
            counter++;
        });

        msocket.push(new Buffer([0x8b, 0x00]));
    });

    it('should close connection on lengths above 0xffffffff', function(done) {
        var counter = 0;
        msocket.on('data', function(chunk) {
            switch (counter) {
                case 0:
                    chunk[0].should.equal(0x88);
                    chunk[1].should.equal(0x02);
                    chunk.length.should.equal(2);
                    break;
                case 1:
                    chunk[0].should.equal(0x03);
                    chunk[1].should.equal(0xf1);
                    chunk.length.should.equal(2);
                    done();
                    break;
            }
            counter++;
        });

        msocket.push(new Buffer([0x82, 0x7f, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]));
    });

});

function closeFrame(counter, chunk, done) {
    switch (counter) {
        case 0:
            chunk[0].should.equal(0x88);
            chunk[1].should.equal(0x02);
            chunk.length.should.equal(2);
            break;
        case 1:
            chunk[0].should.equal(0x03);
            chunk[1].should.equal(0xea);
            chunk.length.should.equal(2);
            done();
            break;
    }
}
