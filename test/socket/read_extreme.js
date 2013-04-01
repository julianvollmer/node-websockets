var WebSocket = require('../../lib/stream');
var MockupSocket = require('./msocket');

describe('WebSocket', function() {

    var msocket, wssocket, body;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('reading extremly chunked frames', function() {
        
        it('like a single byte chunked unmasked text frame', function(done) {
            wssocket.once('head', function(head) {
                head.fin.should.be.true;
                head.rsv1.should.be.false;
                head.rsv2.should.be.false;
                head.rsv3.should.be.false;
                head.mask.should.be.false;
                head.opcode.should.equal(0x01);
                head.length.should.equal(0x05);
            });
            wssocket.once('fend', function() {
                body = wssocket.read();
                body.toString().should.equal('Hello');

                done();
            });
            msocket.push(new Buffer([0x81]));
            msocket.push(new Buffer([0x05]));
            msocket.push(new Buffer([0x48]));
            msocket.push(new Buffer([0x65]));
            msocket.push(new Buffer([0x6c]));
            msocket.push(new Buffer([0x6c]));
            msocket.push(new Buffer([0x6f]));
        });

        // not tested if the test itself is error free
        // but the parseHead method itself does not handle
        // glued frames...
        xit('like a multiple frame chunk', function(done) {
            wssocket.once('head', function(head) {
                console.log('head one', head);
                head.fin.should.be.true;
                head.rsv1.should.be.false;
                head.rsv2.should.be.false;
                head.rsv3.should.be.false;
                head.mask.should.be.true;
                head.opcode.should.equal(0x01);
                head.length.should.equal(0x05);
                wssocket.once('head', function(head) {
                    console.log('head two', head);
                    head.fin.should.be.true;
                    head.rsv1.should.be.false;
                    head.rsv2.should.be.false;
                    head.rsv3.should.be.false;
                    head.mask.should.be.true;
                    head.opcode.should.equal(0x08);
                    head.length.should.equal(0x05);
                });
            });
            var firstFrame = new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]);
            var secondFrame = new Buffer([0x88, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]);
            msocket.push(Buffer.concat([firstFrame, secondFrame]));
        });

    });

});
