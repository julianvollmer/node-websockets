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
            msocket.write(new Buffer([0x88, 0x00]));

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
            wssocket.once('close', function(code) {
                code.should.eql(new Buffer([0x03, 0xe8]));
                done();
            });
            msocket.write(new Buffer([0x88, 0x02]));
            msocket.write(new Buffer([0x03, 0xe8]));
        });

        it('should emit a "pong" event when receiving a pong', function(done) {
            wssocket.once('pong', function(body) {
                body.should.eql(new Buffer('Hey'));
                done();
            });
            msocket.write(new Buffer([0x8a, 0x03, 0x48, 0x65, 0x79]));
        });

        it('should send back a pong frame with ping payload', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                if (!counter) return counter++;
                
                chunk[0].should.equal(0x8a);
                chunk[1].should.equal(0x03);
                chunk[2].should.equal(0x59);
                chunk[3].should.equal(0x61);
                chunk[4].should.equal(0x70);
                done();
            });
            msocket.write(new Buffer([0x89, 0x03, 0x59, 0x61, 0x70]));
        });

        describe('#ping([chunk])', function() {

            it('should send a ping frame', function(done) {
                msocket.once('data', function(chunk) {
                    chunk[0].should.equal(0x89);
                    chunk[1].should.equal(0x00);
                    done();
                });
                wssocket.ping();
            });

            it('should send a ping frame with body', function(done) {
                msocket.once('data', function(chunk) {
                    chunk[0].should.equal(0x89);
                    chunk[1].should.equal(0x04);
                    chunk[2].should.equal(0x70);
                    chunk[3].should.equal(0x69);
                    chunk[4].should.equal(0x6e);
                    chunk[5].should.equal(0x67);
                    done();
                });
                wssocket.ping(new Buffer('ping'));
            });

        });

        describe('#close([code])', function() {

            it('should send a close frame', function(done) {
                msocket.once('data', function(chunk) {
                    chunk[0].should.equal(0x88);
                    chunk[1].should.equal(0x00);
                    done();
                });
                wssocket.close();
            });

            it('should send a close frame with code', function(done) {
                msocket.once('data', function(chunk) {
                    chunk[0].should.equal(0x88);
                    chunk[1].should.equal(0x02);
                    chunk[2].should.equal(0x03);
                    chunk[3].should.equal(0xe9);
                    done();
                });
                wssocket.close(1001);
            });

        });

    });

});
