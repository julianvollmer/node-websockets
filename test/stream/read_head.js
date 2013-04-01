var stream = require('stream');

var WebSocket = require('../../lib/stream');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new stream.Readable();
        msocket._read = function() {};

        wssocket = new WebSocket(msocket);
    });

    describe('Event: "head"', function() {
        
        it('should pass "head" with fin as true', function(done) {
            wssocket.once('head', function(head) {
                head.fin.should.be.true;
                done();
            });
            msocket.push(new Buffer([0x80, 0x00]));
        });

        it('should pass "head" with fin as false', function(done) {
            wssocket.once('head', function(head) {
                head.fin.should.be.false;
                done();
            });
            msocket.push(new Buffer([0x00, 0x00]));
        });

        it('should pass "head" with rsv one to three as true', function(done) {
            wssocket.once('head', function(head) {
                head.rsv1.should.be.true;
                head.rsv2.should.be.true;
                head.rsv3.should.be.true;
                done();
            });
            msocket.push(new Buffer([0x70, 0x00]));
        });

        it('should pass "head" with rsv one to three as false', function(done) {
            wssocket.once('head', function(head) {
                head.rsv1.should.be.false;
                head.rsv2.should.be.false;
                head.rsv3.should.be.false;
                done();
            });
            msocket.push(new Buffer([0x00, 0x00]));
        });

        it('should pass "head" with opcode as 0x00', function(done) {
            wssocket.once('head', function(head) {
                head.opcode.should.equal(0x00);
                done();
            });
            msocket.push(new Buffer([0x00, 0x00]));
        });

        it('should pass "head" with opcode as 0x0a', function(done) {
            wssocket.once('head', function(head) {
                head.opcode.should.equal(0x0a);
                done();
            });
            msocket.push(new Buffer([0x0a, 0x00]));
        });

        it('should pass "head" with mask as true', function(done) {
            wssocket.once('head', function(head) {
                head.mask.should.be.true;
                done();
            });
            msocket.push(new Buffer([0x00, 0x80, 0x74, 0x03, 0xf3, 0xd3]));
        });

        it('should pass "head" with mask as false', function(done) {
            wssocket.once('head', function(head) {
                head.mask.should.be.false;
                done();
            });
            msocket.push(new Buffer([0x00, 0x00]));
        });

        it('should pass "head" with length of 0', function(done) {
            wssocket.once('head', function(head) {
                head.length.should.equal(0);
                done();
            });
            msocket.push(new Buffer([0x00, 0x00]));
        });

        it('should pass "head" with length of 125', function(done) {
            wssocket.once('head', function(head) {
                head.length.should.equal(125);
                done();
            });
            msocket.push(new Buffer([0x00, 0x7d]));
        });

        it('should pass "head" with length of 126', function(done) {
            wssocket.once('head', function(head) {
                head.length.should.equal(126);
                done();
            });
            msocket.push(new Buffer([0x00, 0x7e, 0x00, 0x7e]));
        });

        it('should pass "head" with length of 127', function(done) {
            wssocket.once('head', function(head) {
                head.length.should.equal(127);
                done();
            });
            msocket.push(new Buffer([0x00, 0x7e, 0x00, 0x7f]));
        });

        it('should pass "head" with length of 65535', function(done) {
            wssocket.once('head', function(head) {
                head.length.should.equal(65535);
                done();
            });
            msocket.push(new Buffer([0x00, 0x7e, 0xff, 0xff]));
        });

        it('should pass "head" with length of 65536', function(done) {
            wssocket.once('head', function(head) {
                head.length.should.equal(65536);
                done();
            });
            msocket.push(new Buffer([0x00, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]));
        });

        it('should pass "head" with length of 4294967295', function(done) {
            wssocket.once('head', function(head) {
                head.length.should.equal(4294967295);
                done();
            });
            msocket.push(new Buffer([0x00, 0x7f, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]));
        });

        it('should set masking to null if no mask is present', function(done) {
            wssocket.once('head', function(head) {
                head.mask.should.be.false;
                head.masking.length.should.equal(0);
                done();
            });
            msocket.push(new Buffer([0x00, 0x00]));
        });

        it('should pass "head" with masking bytes when length < 126', function(done) {
            wssocket.once('head', function(head) {
                head.mask.should.be.true;
                head.masking.toString('base64').should.equal('WKK+dA==');
                done();
            });
            msocket.push(new Buffer([0x00, 0x80, 0x58, 0xa2, 0xbe, 0x74]));
        });

        it('should pass "head" with masking bytes when length < 65536', function(done) {
            wssocket.once('head', function(head) {
                head.mask.should.be.true;
                head.masking.toString('base64').should.equal('MMJBKA==');
                done();
            });
            msocket.push(new Buffer([0x00, 0xfe, 0x00, 0x00, 0x30, 0xc2, 0x41, 0x28]));
        });

        it('should pass "head" with masking bytes when length < 4294967296', function(done) {
            wssocket.once('head', function(head) {
                head.mask.should.be.true;
                head.masking.toString('base64').should.equal('zU4iCA==');
                done();
            });
            msocket.push(new Buffer([0x00, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xcd, 0x4e, 0x22, 0x08]));
        });

    });

});
