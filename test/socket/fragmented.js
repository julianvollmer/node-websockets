var MockupSocket = require('../mockup/socket');

var WebSocket = require('../../lib/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    it('should concat two unmasked fragmented frames together', function(done) {
        wssocket.once('message', function(message) {
            message.should.equal('Hello');
            done();
        });
        msocket.write(new Buffer([0x01, 0x02, 0x48, 0x65]));
        msocket.write(new Buffer([0x80, 0x03, 0x6c, 0x6c, 0x6f]));
    });


    it('should concat five unmasked fragmented frames together', function(done) {
        wssocket.once('message', function(message) {
            message.should.equal('Hello');
            done();
        });
        msocket.write(new Buffer([0x01, 0x01, 0x48]));
        msocket.write(new Buffer([0x00, 0x01, 0x65]));
        msocket.write(new Buffer([0x00, 0x01, 0x6c]));
        msocket.write(new Buffer([0x00, 0x01, 0x6c]));
        msocket.write(new Buffer([0x80, 0x01, 0x6f]));
    });

    it('should concat two masked fragmented frames together', function(done) {
        wssocket.once('message', function(message) {
            message.should.equal('Hello');
            done();
        });
        msocket.write(new Buffer([0x01, 0x82, 0x0c, 0x2f, 0x27, 0x3d, 0x44, 0x4a]));
        msocket.write(new Buffer([0x80, 0x83, 0x82, 0x34, 0xb2, 0x07, 0xee, 0x58, 0xdd]));
    });

    it('should concat five masked fragmented frames together', function(done) {
        wssocket.once('message', function(message) {
            message.should.equal('Hello');
            done();
        });
        msocket.write(new Buffer([0x01, 0x81, 0x5c, 0xc1, 0x5b, 0x70, 0x14]));
        msocket.write(new Buffer([0x00, 0x81, 0xe5, 0x48, 0x5f, 0xa1, 0x80]));
        msocket.write(new Buffer([0x00, 0x81, 0x2c, 0xa6, 0xc2, 0x2b, 0x40]));
        msocket.write(new Buffer([0x00, 0x81, 0x5d, 0x5d, 0x1c, 0xd3, 0x31]));
        msocket.write(new Buffer([0x80, 0x81, 0x50, 0xeb, 0x48, 0x72, 0x3f]));
    });
});
