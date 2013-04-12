var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Event: "close"', function() {

        it('should be emitted on empty close', function(done) {
            wssocket.once('close', function() {
                done();
            });

            msocket.push(new Buffer([0x88, 0x00]));
        });

        it('should be emitted on simple close', function(done) {
            wssocket.once('close', function(payload) {
                payload.should.eql(new Buffer('Hey'));
                payload.length.should.equal(3);
                done();
            });

            msocket.push(new Buffer([0x88, 0x03, 0x48, 0x65, 0x79]));
        });

    });

    describe('#close([message])', function() {

        it('should send an empty close', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x88);
                        chunk[1].should.equal(0x02);
                        chunk.length.should.equal(2);
                        break;
                    case 1:
                        chunk[0].should.equal(0x03);
                        chunk[1].should.equal(0xe8);
                        chunk.length.should.equal(2);
                        done();
                        break;
                }
                counter++;
            });

            wssocket.close();
        });

        it('should send a close with status code', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x88);
                        chunk[1].should.equal(0x02);
                        break;
                    case 1:
                        chunk[0].should.equal(0x03);
                        chunk[1].should.equal(0xe9);
                        done();
                        break;
                }
                counter++;
            });

            wssocket.close(1001);
        });

        it('should send a close with message', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x88);
                        chunk[1].should.equal(0x03);
                        break;
                    case 1:
                        chunk[0].should.equal(0x48);
                        chunk[1].should.equal(0x65);
                        chunk[2].should.equal(0x79);
                        done();
                        break;
                }
                counter++;
            });

            wssocket.close('Hey');
        });

    });

});
