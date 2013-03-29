var util = require('util');
var crypto = require('crypto');

var mockupFrames = require('../mockup/frames');

var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var head, masking, wsFrame;

    describe(' = new WebSocketFrame(frame)', function() {
 
        it('should map unmasked frames with length of 125', function(done) {
            crypto.randomBytes(125, function(err, payload) {
                head = new Buffer([0x82, 0x7d]);
                wsFrame = new WebSocketFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7d);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 126', function(done) {
            crypto.randomBytes(126, function(err, payload) {
                head = new Buffer([0x82, 0x7e, 0x00, 0x7e]);
                wsFrame = new WebSocketFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7e);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 127', function(done) {
            crypto.randomBytes(127, function(err, payload) {
                head = new Buffer([0x82, 0x7e, 0x00, 0x7f]);
                wsFrame = new WebSocketFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7f);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 65535 bytes', function(done) {
            crypto.randomBytes(0xffff, function(err, payload) {
                head = new Buffer([0x82, 0x7e, 0xff, 0xff]);
                wsFrame = new WebSocketFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0xffff);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 65536 bytes', function(done) {
            crypto.randomBytes(0x10000, function(err, payload) {
                head = new Buffer([0x82, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
                wsFrame = new WebSocketFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x10000);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 16777215 bytes', function(done) {
            crypto.randomBytes(0xffffff, function(err, payload) {
                head = new Buffer([0x82, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff]);
                wsFrame = new WebSocketFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0xffffff);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 125', function(done) {
            crypto.randomBytes(125, function(err, payload) {
                head = new Buffer([0x82, 0xfd]);
                masking = crypto.randomBytes(4);
                wsFrame = new WebSocketFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7d);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 126', function(done) {
            crypto.randomBytes(126, function(err, payload) {
                head = new Buffer([0x82, 0xfe, 0x00, 0x7e]);
                masking = crypto.randomBytes(4);
                wsFrame = new WebSocketFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7e);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 127', function(done) {
            crypto.randomBytes(127, function(err, payload) {
                head = new Buffer([0x82, 0xfe, 0x00, 0x7f]);
                masking = crypto.randomBytes(4);
                wsFrame = new WebSocketFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7f);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 65535 bytes', function(done) {
            crypto.randomBytes(0xffff, function(err, payload) {
                head = new Buffer([0x82, 0xfe, 0xff, 0xff]);
                masking = crypto.randomBytes(4);
                wsFrame = new WebSocketFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0xffff);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 65536 bytes', function(done) {
            crypto.randomBytes(0x10000, function(err, payload) {
                head = new Buffer([0x82, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
                masking = crypto.randomBytes(4);
                wsFrame = new WebSocketFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x10000);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 16777215 bytes', function(done) {
            crypto.randomBytes(0xffffff, function(err, payload) {
                head = new Buffer([0x82, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff]);
                masking = crypto.randomBytes(4);
                wsFrame = new WebSocketFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0xffffff);
                wsFrame.getContent().toString().should.equal(payload.toString());
                done();
            });
        });
        
        it('should map the first fragment of an unmasked text frame', function() {
            wsFrame = new WebSocketFrame(new Buffer([0x01, 0x03, 0x48, 0x65, 0x6c]));
            wsFrame.fin.should.be.false;
            wsFrame.mask.should.be.false;
            wsFrame.opcode.should.equal(0x01);
            wsFrame.length.should.equal(0x03);
            wsFrame.getContent().toString().should.equal('Hel');
        });

        it('should map the second fragment of an unmasked text frame', function() {
            wsFrame = new WebSocketFrame(new Buffer([0x80, 0x02, 0x6c, 0x6f]));
            wsFrame.fin.should.be.true;
            wsFrame.mask.should.be.false;
            wsFrame.opcode.should.equal(0x00);
            wsFrame.length.should.equal(0x02);
            wsFrame.getContent().toString().should.equal('lo');
        });

        mockupFrames.each(function(name, mock) {
           
            it('should map the raw frame buffer properly to readable properties', function() {
                wsFrame = new WebSocketFrame(mock.frame);
                wsFrame.should.have.property('fin', mock.fin);
                wsFrame.should.have.property('mask', mock.mask);
                wsFrame.should.have.property('opcode', mock.opcode);
                wsFrame.should.have.property('length', mock.length);
                wsFrame.masking.toString().should.equal(mock.masking.toString());
                wsFrame.payload.toString().should.equal(mock.payload.toString());
                wsFrame.getContent().toString().should.equal(mock.content.toString());
            });
        
        });

    });
    
});

function mask(masking, payload) {
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++)
        unmasked[i] = payload[i] ^ masking[i % 4];
 
    return unmasked;
}
