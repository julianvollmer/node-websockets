var crypto = require('crypto');

var MockupSocket = require('./msocket');
var WebSocket = require('../../lib/stream');

describe('WebSocket', function() {

    var msocket, wssocket, head, body, masking, content, frame;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('writing frame bodies', function() {

        it('should write an unmasked frame fragment', function(done) {
            head = new Buffer([0x02, 0x05]);
            body = new Buffer([0x48, 0x68, 0x6f, 0x6f, 0x6c]);
            frame = Buffer.concat([head, body]);

            msocket.once('data', function(chunk) {
                chunk.length.should.equal(7);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });

            wssocket.writeHead({ opcode: 0x02 });;
            wssocket.write(body);
        });

        it('should write unmasked binary frame, length == 125', function(done) {
            head = new Buffer([0x82, 0x7d]);
            content = crypto.randomBytes(125);
            frame = Buffer.concat([head, content]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(127);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });

            wssocket.writeHead({ opcode: 0x02 });;
            wssocket.writeEnd(content);
        });

        it('should write unmasked binary frame, length == 126', function(done) {
            head = new Buffer([0x82, 0x7e, 0x00, 0x7e]);
            content = crypto.randomBytes(126);
            frame = Buffer.concat([head, content]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(130);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });
            wssocket.writeHead({ opcode: 0x02 });;
            wssocket.writeEnd(content);
        });

        it('should write unmasked binary frame, length == 127', function(done) {
            head = new Buffer([0x82, 0x7e, 0x00, 0x7f]);
            content = crypto.randomBytes(127);
            frame = Buffer.concat([head, content]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(131);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });
            wssocket.writeHead({ opcode: 0x02 });;
            wssocket.writeEnd(content);
        });

        it('should write unmasked binary frame, length == 65535', function(done) {
            head = new Buffer([0x82, 0x7e, 0xff, 0xff]);
            content = crypto.randomBytes(65535);
            frame = Buffer.concat([head, content]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(65539);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });
            wssocket.writeHead({ opcode: 0x02 });;
            wssocket.writeEnd(content);
        });

        it('should write unmasked binary frame, length == 65536', function(done) {
            head = new Buffer([0x82, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
            content = crypto.randomBytes(65536);
            frame = Buffer.concat([head, content]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(65546);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });
            wssocket.writeHead({ opcode: 0x02 });;
            wssocket.writeEnd(content);
        });

        it('should write masked binary frame, length == 125', function(done) {
            head = new Buffer([0x82, 0xfd]);
            masking = crypto.randomBytes(4);
            content = crypto.randomBytes(125);
            frame = Buffer.concat([head, masking, mask(masking, content)]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(131);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });
            wssocket.writeHead({ opcode: 0x02, masking: masking });;
            wssocket.writeEnd(content);
        });

        it('should write masked binary frame, length == 126', function(done) {
            head = new Buffer([0x82, 0xfe, 0x00, 0x7e]);
            masking = crypto.randomBytes(4);
            content = crypto.randomBytes(126);
            frame = Buffer.concat([head, masking, mask(masking, content)]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(134);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });
            wssocket.writeHead({ opcode: 0x02, masking: masking });;
            wssocket.writeEnd(content);
        });

        it('should write masked binary frame, length == 127', function(done) {
            head = new Buffer([0x82, 0xfe, 0x00, 0x7f]);
            masking = crypto.randomBytes(4);
            content = crypto.randomBytes(127);
            frame = Buffer.concat([head, masking, mask(masking, content)]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(135);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });
            wssocket.writeHead({ opcode: 0x02, masking: masking });;
            wssocket.writeEnd(content);
        });

        it('should write masked binary frame, length == 65535', function(done) {
            head = new Buffer([0x82, 0xfe, 0xff, 0xff]);
            masking = crypto.randomBytes(4);
            content = crypto.randomBytes(65535);
            frame = Buffer.concat([head, masking, mask(masking, content)]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(65543);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });
            wssocket.writeHead({ opcode: 0x02, masking: masking });;
            wssocket.writeEnd(content);
        });

        it('should write masked binary frame, length == 65536', function(done) {
            head = new Buffer([0x82, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
            masking = crypto.randomBytes(4);
            content = crypto.randomBytes(65536);
            frame = Buffer.concat([head, masking, mask(masking, content)]);
            
            msocket.once('data', function(chunk) {
                chunk.length.should.equal(65550);
                chunk.toString('base64').should.equal(frame.toString('base64'));

                done();
            });
            wssocket.writeHead({ opcode: 0x02, masking: masking });;
            wssocket.writeEnd(content);
        });

    });

});

function mask(masking, payload) {
    var length = payload.length;
    var masked = new Buffer(length);

    for (var i = 0; i < length; i++)
        masked[i] = payload[i] ^ masking[i % 4];

    return masked;
}
