var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Control Frame Handling', function() {

        it('should close the connection on a close frame', function() {
            msocket.push(new Buffer([0x88, 0x00]));

            wssocket.once('close', function() {
                (function() {
                    wssocket.write(new Buffer('Hello'));
                }).should.throwError();
                (function() {
                    wssocket.push(new Buffer('World')).should.be.false;
                })
            });
        });

        it('should emit a "close" event on a close frame', function(done) {
            wssocket.once('close', function(payload) {
                payload.should.eql(new Buffer([0x03, 0x0e8]));
                done();
            });
            
            msocket.push(new Buffer([0x88, 0x02]));
            msocket.push(new Buffer([0x03, 0xe8]));
        });

        it('should emit a "pong" event when receiving a pong', function(done) {
            wssocket.once('pong', function(body) {
                body.should.eql(new Buffer('Hey'));
                done();
            });

            msocket.push(new Buffer([0x8a, 0x03, 0x48, 0x65, 0x79]));
        });

        it('should send back a pong frame with ping payload', function(done) {
            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x8a);
                chunk[1].should.equal(0x03);
                chunk[2].should.equal(0x59);
                chunk[3].should.equal(0x61);
                chunk[4].should.equal(0x70);
                done();
            });
            
            msocket.push(new Buffer([0x89, 0x03, 0x59, 0x61, 0x70]));
        });

    });

});
