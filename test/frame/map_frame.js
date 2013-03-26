var util = require('util');
var crypto = require('crypto');

var mockupFrames = require('../mockup/frames');

var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var head, masking, wsFrame;

    beforeEach(function() {
        wsFrame = new WebSocketFrame();
    });

    describe('#mapFrame(frame)', function() {
 
        it('should map unmasked frames with length of 125', function(done) {
            crypto.randomBytes(125, function(err, payload) {
                head = new Buffer([0x82, 0x7d]);
                wsFrame.mapFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7d);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 126', function(done) {
            crypto.randomBytes(126, function(err, payload) {
                head = new Buffer([0x82, 0x7e, 0x00, 0x7e]);
                wsFrame.mapFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7e);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 127', function(done) {
            crypto.randomBytes(127, function(err, payload) {
                head = new Buffer([0x82, 0x7e, 0x00, 0x7f]);
                wsFrame.mapFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7f);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 65535 bytes', function(done) {
            crypto.randomBytes(0xffff, function(err, payload) {
                head = new Buffer([0x82, 0x7e, 0xff, 0xff]);
                wsFrame.mapFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0xffff);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 65536 bytes', function(done) {
            crypto.randomBytes(0x10000, function(err, payload) {
                head = new Buffer([0x82, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
                wsFrame.mapFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x10000);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map unmasked frames with length of 16777215 bytes', function(done) {
            crypto.randomBytes(0xffffff, function(err, payload) {
                head = new Buffer([0x82, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff]);
                wsFrame.mapFrame(Buffer.concat([head, payload]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.false;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0xffffff);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 125', function(done) {
            crypto.randomBytes(125, function(err, payload) {
                head = new Buffer([0x82, 0xfd]);
                masking = crypto.randomBytes(4);
                wsFrame.mapFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7d);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 126', function(done) {
            crypto.randomBytes(126, function(err, payload) {
                head = new Buffer([0x82, 0xfe, 0x00, 0x7e]);
                masking = crypto.randomBytes(4);
                wsFrame.mapFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7e);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 127', function(done) {
            crypto.randomBytes(127, function(err, payload) {
                head = new Buffer([0x82, 0xfe, 0x00, 0x7f]);
                masking = crypto.randomBytes(4);
                wsFrame.mapFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x7f);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 65535 bytes', function(done) {
            crypto.randomBytes(0xffff, function(err, payload) {
                head = new Buffer([0x82, 0xfe, 0xff, 0xff]);
                masking = crypto.randomBytes(4);
                wsFrame.mapFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0xffff);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 65536 bytes', function(done) {
            crypto.randomBytes(0x10000, function(err, payload) {
                head = new Buffer([0x82, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
                masking = crypto.randomBytes(4);
                wsFrame.mapFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0x10000);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });

        it('should map masked frames with length of 16777215 bytes', function(done) {
            crypto.randomBytes(0xffffff, function(err, payload) {
                head = new Buffer([0x82, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff]);
                masking = crypto.randomBytes(4);
                wsFrame.mapFrame(Buffer.concat([head, masking, mask(masking, payload)]));
                wsFrame.fin.should.be.true;
                wsFrame.mask.should.be.true;
                wsFrame.opcode.should.equal(0x02);
                wsFrame.length.should.equal(0xffffff);
                wsFrame.content.toString().should.equal(payload.toString());
                done();
            });
        });
        
        it('should map the first fragment of an unmasked text frame', function() {
            wsFrame.mapFrame(new Buffer([0x01, 0x03, 0x48, 0x65, 0x6c]));
            wsFrame.fin.should.be.false;
            wsFrame.mask.should.be.false;
            wsFrame.opcode.should.equal(0x01);
            wsFrame.length.should.equal(0x03);
            wsFrame.content.toString().should.equal('Hel');
        });

        it('should map the first fragment of an unmasked text frame', function() {
            wsFrame.mapFrame(new Buffer([0x80, 0x02, 0x6c, 0x6f]));
            wsFrame.fin.should.be.true;
            wsFrame.mask.should.be.false;
            wsFrame.opcode.should.equal(0x00);
            wsFrame.length.should.equal(0x02);
            wsFrame.content.toString().should.equal('lo');
        });

        mockupFrames.each(function(name, mock) {
           
            it('should actually have such a method', function() {
                wsFrame.should.have.property('mapFrame').be.a('function');
            });
            
            it('should map the raw frame buffer properly to readable properties', function() {
                wsFrame.mapFrame(mock.frame);
                wsFrame.glued.should.be.false;
                wsFrame.should.have.property('fin', mock.fin, util.format('property fin is expected to be %s', mock.fin));
                wsFrame.should.have.property('mask', mock.mask, util.format('property mask is expected to be %s', mock.mask));
                wsFrame.should.have.property('opcode', mock.opcode, util.format('property opcode is expected to be %s', mock.opcode));
                wsFrame.should.have.property('length', mock.length, util.format('property length is expected to be %s', mock.length, name));
                wsFrame.masking.toString().should.equal(mock.masking.toString(), util.format('property masking is expected to be %s', mock.masking));
                wsFrame.payload.toString().should.equal(mock.payload.toString(), util.format('property payload is expected to be %s', mock.masking));
                wsFrame.content.toString().should.equal(mock.content.toString(), util.format('property content is expected to be %s', mock.masking));
            });
        
        });

        it('should handle glued frames properly', function() {
            var firstFrame = mockupFrames.maskedPingFrame;
            var secondFrame = mockupFrames.singleMaskedTextFrame;

            var gluedFrames = Buffer.concat([firstFrame.frame, secondFrame.frame]);

            wsFrame.mapFrame(gluedFrames);
            wsFrame.fin.should.be.true;
            wsFrame.rsv1.should.be.false;
            wsFrame.rsv2.should.be.false;
            wsFrame.rsv3.should.be.false;
            wsFrame.should.have.property('mask', firstFrame.mask);
            wsFrame.should.have.property('glued', true);
            wsFrame.should.have.property('opcode', firstFrame.opcode);
            wsFrame.should.have.property('length', firstFrame.length);
            wsFrame.content.toString().should.equal(firstFrame.content.toString());

            var secondWsFrame = new WebSocketFrame(wsFrame.remnant);
            secondWsFrame.fin.should.be.true;
            secondWsFrame.rsv1.should.be.false;
            secondWsFrame.rsv2.should.be.false;
            secondWsFrame.rsv3.should.be.false;
            secondWsFrame.should.have.property('mask', secondFrame.mask);
            secondWsFrame.should.have.property('glued', false);
            secondWsFrame.should.have.property('opcode', secondFrame.opcode);
            secondWsFrame.should.have.property('length', secondFrame.length);
            secondWsFrame.content.toString().should.equal(secondFrame.content.toString());
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
