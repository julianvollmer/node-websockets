var crypto = require('crypto');
var stream = require('stream');

var WebSocketStream = require('../../lib/stream');

describe('WebSocketStream', function() {

    var msocket, wsstream, content;

    beforeEach(function() {
        msocket = new stream.Readable();
        msocket._read = function() {};

        wsstream = new WebSocketStream(msocket);
    });

    describe('reading frame body', function() {

        it('should read body of unmasked text frame containing "Hello"', function(done) {
            wsstream.on('readable', function() {
                content = wsstream.read();
                content.toString().should.equal('Hello');
                
                done();
            });
            
            msocket.push(new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]));
        });

        it('should read body of masked text frame containing "Hello"', function(done) {
            wsstream.on('readable', function() {
                content = wsstream.read();
                content.toString().should.equal('Hello');
                
                done();
            });
            
            msocket.push(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
        });

        it('should read body of masked binary frame containing 125 random bytes', function(done) {
            var head = new Buffer([0x81, 0xfd]);
            var masking = crypto.randomBytes(4);
            var payload = crypto.randomBytes(125);

            wsstream.on('readable', function() {
                content = wsstream.read();
                content.toString('base64').should.equal(payload.toString('base64'));

                done();
            });
            
            msocket.push(Buffer.concat([head, masking, mask(masking, payload)]));
        });

        it('should read body of masked binary frame containing 126 random bytes', function(done) {
            var head = new Buffer([0x81, 0xfe, 0x00, 0x7e]);
            var masking = crypto.randomBytes(4);
            var payload = crypto.randomBytes(126);

            wsstream.on('readable', function() {
                content = wsstream.read();
                content.toString('base64').should.equal(payload.toString('base64'));

                done();
            });
            
            msocket.push(Buffer.concat([head, masking, mask(masking, payload)]));
        });

        it('should read body of masked binary frame containing 127 random bytes', function(done) {
            var head = new Buffer([0x81, 0xfe, 0x00, 0x7f]);
            var masking = crypto.randomBytes(4);
            var payload = crypto.randomBytes(127);

            wsstream.on('readable', function() {
                content = wsstream.read();
                content.toString('base64').should.equal(payload.toString('base64'));

                done();
            });
            
            msocket.push(Buffer.concat([head, masking, mask(masking, payload)]));
        });

        it('should read body of masked binary frame containing 65535 random bytes', function(done) {
            var head = new Buffer([0x81, 0xfe, 0xff, 0xff]);
            var masking = crypto.randomBytes(4);
            var payload = crypto.randomBytes(65535);

            wsstream.on('readable', function() {
                content = wsstream.read();
                content.toString('base64').should.equal(payload.toString('base64'));

                done();
            });
            
            msocket.push(Buffer.concat([head, masking, mask(masking, payload)]));
        });

        it('should read body of masked binary frame containing 65536 random bytes', function(done) {
            var head = new Buffer([0x81, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
            var masking = crypto.randomBytes(4);
            var payload = crypto.randomBytes(65536);

            wsstream.on('readable', function() {
                content = wsstream.read();
                content.toString('base64').should.equal(payload.toString('base64'));

                done();
            });
            
            msocket.push(Buffer.concat([head, masking, mask(masking, payload)]));
        });

        xit('should read body of masked binary frame containing 1048576 random bytes', function(done) {
            var head = new Buffer([0x81, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
            var masking = crypto.randomBytes(4);
            
            var payload;
            var payloads = [];
            payloads.push(crypto.randomBytes(0x4000));
            payloads.push(crypto.randomBytes(0x4000));
            payloads.push(crypto.randomBytes(0x4000));
            payloads.push(crypto.randomBytes(0x4000));

            var index = 0;
            wsstream.on('readable', function() {
                if (index == 4) done();

                content = wsstream.read();
                content.toString('base64').should.equal(payloads[index].toString('base64'));
                index++;
            });
            
            msocket.push(Buffer.concat([head, masking]));
            msocket.push(mask(masking, payloads[0]), 0x0000);
            msocket.push(mask(masking, payloads[1]), 0x4000);
            msocket.push(mask(masking, payloads[2]), 0x8000);
            msocket.push(mask(masking, payloads[3]), 0xc000);
        });

    });

});

function mask(masking, payload, index) {
    index = (index || 0)

    var length = payload.length;
    var masked = new Buffer(length);

    for (var i = 0; i < length; i++)
        masked[i] = payload[i] ^ masking[(index + i) % 4];

    return masked;
}
