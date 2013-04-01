var WebSocket = require('../../lib/stream');
var MockupSocket = require('./msocket');

describe('WebSocket', function() {

    var msocket, wssocket, body;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('reading frames as single byte chunk', function() {
        
        it('should read a single byte chunked unmasked text frame', function(done) {
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

    });

});
