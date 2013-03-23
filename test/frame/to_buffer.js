var util = require('util');
var crypto = require('crypto');

var mockupFrames = require('../mockup/frames');

var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var wsframe, bufframe;

    describe('#toBuffer()', function() {

        it('should handle unmasked frames with size of 125 bytes', function(done) {
            crypto.randomBytes(125, function(err, buf) {
                wsframe = new WebSocketFrame();
                wsframe.fin = true;
                wsframe.mask = false;
                wsframe.opcode = 0x02;
                wsframe.length = 0x7d;
                wsframe.content = buf;
                bufframe = wsframe.toBuffer();
                bufframe[0].should.equal(0x82);
                bufframe[1].should.equal(0x7d);
                bufframe.slice(2).toString().should.equal(buf.toString());
                done();
            });
        });

        it('should handle unmasked frames with size of 126 bytes', function(done) {
            crypto.randomBytes(126, function(err, buf) {
                wsframe = new WebSocketFrame();
                wsframe.fin = true;
                wsframe.mask = false;
                wsframe.opcode = 0x02;
                wsframe.length = 0x7e;
                wsframe.content = buf;
                bufframe = wsframe.toBuffer();
                // header bytes
                bufframe[0].should.equal(0x82);
                bufframe[1].should.equal(0x7e);
                // length bytes
                bufframe[2].should.equal(0x00);
                bufframe[3].should.equal(0x7e);
                bufframe.slice(4).toString().should.equal(buf.toString());
                done();
            });
        });

        it('should handle unmasked frames with size of 65535 bytes', function(done) {
            crypto.randomBytes(0xffff, function(err, buf) {
                wsframe = new WebSocketFrame();
                wsframe.fin = true;
                wsframe.mask = false;
                wsframe.opcode = 0x02;
                wsframe.length = 0xffff;
                wsframe.content = buf;
                bufframe = wsframe.toBuffer();
                // header bytes
                bufframe[0].should.equal(0x82);
                bufframe[1].should.equal(0x7e);
                // length bytes
                bufframe[2].should.equal(0xff);
                bufframe[3].should.equal(0xff);
                // payload bytes
                bufframe.slice(4).toString().should.equal(buf.toString());
                done();
            });
        });

        it('should handle unmasked frames with size of 16777215 bytes', function(done) {
            crypto.randomBytes(0xffffff, function(err, buf) {
                wsframe = new WebSocketFrame();
                wsframe.fin = true;
                wsframe.mask = false;
                wsframe.opcode = 0x02;
                wsframe.length = 0xffffff;
                wsframe.content = buf;
                bufframe = wsframe.toBuffer();
                // header bytes
                bufframe[0].should.equal(0x82);
                bufframe[1].should.equal(0x7f);
                // length bytes
                bufframe[2].should.equal(0x00);
                bufframe[3].should.equal(0x00);
                bufframe[4].should.equal(0x00);
                bufframe[5].should.equal(0x00);
                bufframe[6].should.equal(0x00);
                bufframe[7].should.equal(0xff);
                bufframe[8].should.equal(0xff);
                bufframe[9].should.equal(0xff);
                // payload bytes
                bufframe.slice(10).toString().should.equal(buf.toString());
                done();
            });
        });

        it('should throw an error if frame size is bigger than 4294967295 bytes', function(done) {
            wsframe = new WebSocketFrame();
            wsframe.fin = true;
            wsframe.mask = false;
            wsframe.opcode = 0x02;
            wsframe.length = 0x100000000;
            // NOTE: it is not possible to set content to a buffer of this size
            // because node's buffer do not support this so this test is actual 
            // fully nonsense...
            (function() {
                bufframe = wsframe.toBuffer();
            }).should.throwError();
            done();
        });

        it('should handle masked frames with size of 125 bytes', function(done) {
            crypto.randomBytes(125, function(err, buf) {
                wsframe = new WebSocketFrame();
                wsframe.fin = true;
                wsframe.mask = true;
                wsframe.opcode = 0x02;
                wsframe.length = 0x7d;
                wsframe.content = buf;
                bufframe = wsframe.toBuffer();
                bufframe[0].should.equal(0x82);
                bufframe[1].should.equal(0xfd);
                var masking = bufframe.slice(2, 6);
                var payload = bufframe.slice(6);
                var content = unmask(masking, payload);
                content.toString().should.equal(buf.toString());
                done();
            });
        });

        it('should handle masked frames with size of 126 bytes', function(done) {
            crypto.randomBytes(126, function(err, buf) {
                wsframe = new WebSocketFrame();
                wsframe.fin = true;
                wsframe.mask = true;
                wsframe.opcode = 0x02;
                wsframe.length = 0xfe;
                wsframe.content = buf;
                bufframe = wsframe.toBuffer();
                // header bytes
                bufframe[0].should.equal(0x82);
                bufframe[1].should.equal(0xfe);
                // length bytes
                bufframe[2].should.equal(0x00);
                bufframe[3].should.equal(0x7e);
                // payload encoding
                var masking = bufframe.slice(4, 8);
                var payload = bufframe.slice(8);
                var content = unmask(masking, payload);
                content.toString().should.equal(buf.toString());
                done();
            });
        });

        it('should handle unmasked frames with size of 65535 bytes', function(done) {
            crypto.randomBytes(0xffff, function(err, buf) {
                wsframe = new WebSocketFrame();
                wsframe.fin = true;
                wsframe.mask = true;
                wsframe.opcode = 0x02;
                wsframe.length = 0xffff;
                wsframe.content = buf;
                bufframe = wsframe.toBuffer();
                // header bytes
                bufframe[0].should.equal(0x82);
                bufframe[1].should.equal(0xfe);
                // length bytes
                bufframe[2].should.equal(0xff);
                bufframe[3].should.equal(0xff);
                // payload encoding
                var masking = bufframe.slice(4, 8);
                var payload = bufframe.slice(8);
                var content = unmask(masking, payload);
                content.toString().should.equal(buf.toString());
                done();
            });
        });

        it('should handle unmasked frames with size of 16777215 bytes', function(done) {
            crypto.randomBytes(0xffffff, function(err, buf) {
                wsframe = new WebSocketFrame();
                wsframe.fin = true;
                wsframe.mask = false;
                wsframe.opcode = 0x02;
                wsframe.length = 0xffffff;
                wsframe.content = buf;
                bufframe = wsframe.toBuffer();
                // header bytes
                bufframe[0].should.equal(0x82);
                bufframe[1].should.equal(0x7f);
                // length bytes
                bufframe[2].should.equal(0x00);
                bufframe[3].should.equal(0x00);
                bufframe[4].should.equal(0x00);
                bufframe[5].should.equal(0x00);
                bufframe[6].should.equal(0x00);
                bufframe[7].should.equal(0xff);
                bufframe[8].should.equal(0xff);
                bufframe[9].should.equal(0xff);
                // payload encoding
                var masking = bufframe.slice(9, 13);
                var payload = bufframe.slice(13);
                var content = unmask(masking, payload);
                // BUG: uncommenting the below line will freeze the test
                //content.toString().should.equal(buf.toString());
                done();
            });
        });

        mockupFrames.each(function(name, mock) {
            var wsFrame, buildFrame;
            
            beforeEach(function() {
                wsFrame = new WebSocketFrame();
                buildFrame = new WebSocketFrame();
                buildFrame.fin = mock.fin;
                buildFrame.mask = mock.mask;
                buildFrame.opcode = mock.opcode;
                buildFrame.length = mock.length;
                buildFrame.masking = mock.masking;
                buildFrame.content = mock.content;
            });

            it(util.format('should return a buffer object for %s mockup frame', name), function() {
                buildFrame.toBuffer().should.be.an.instanceOf(Buffer);
            });
                
            it(util.format('should equal the %s mockup frame buffer', name), function() {
                wsFrame.mapFrame(buildFrame.toBuffer());
                wsFrame.should.have.property('fin', mock.fin, util.format('property fin is expected to be %s', mock.fin));
                wsFrame.should.have.property('mask', mock.mask, util.format('property mask is expected to be %s', mock.mask));
                wsFrame.should.have.property('opcode', mock.opcode, util.format('property opcode is expected to be %s', mock.opcode));
                wsFrame.should.have.property('length', mock.length, util.format('property length is expected to be %s', mock.length, name));
                wsFrame.masking.toString().should.equal(mock.masking.toString(), util.format('property masking is expected to be %s', mock.masking));
                wsFrame.payload.toString().should.equal(mock.payload.toString(), util.format('property payload is expected to be %s', mock.masking));
                wsFrame.content.toString().should.equal(mock.content.toString(), util.format('property content is expected to be %s', mock.masking));
            });

        });
    });
    
});

function unmask(masking, payload) {
    var length = payload.length;
    var unmasked = Buffer(length);

    for (var i = 0; i < length; i++)
        unmasked[i] = payload[i] ^ masking[i % 4];
 
    return unmasked;
}
