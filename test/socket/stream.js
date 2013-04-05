var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Event: "stream"', function() {

        // TODO: make wsstream really write data on us..
        it('should be emit a stream start and end', function(done) {
            var counter = 0;

            wssocket.once('stream:start', function() {
                
                wssocket.once('stream:end', function() {
                    // the data is not getting piped properly...
                    //wssocket._wsstream.read().should.eql(new Buffer('Hey'));
                    done();
                });
            });

            msocket.write(new Buffer([0x02, 0x01, 0x48]));
            msocket.write(new Buffer([0x00, 0x01, 0x65]));
            msocket.write(new Buffer([0x80, 0x01, 0x79]));
        });

    });

    xdescribe('#stream([chunk])', function() {

        it('should stream an empty binary', function(done) {
            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x82);
                chunk[1].should.equal(0x00);
                chunk.length.should.equal(2);
                done();
            });

            wssocket.stream();
        });

        it('should stream two binary frames', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x02);
                        chunk[1].should.equal(0x03);
                        chunk[2].should.equal(0x01);
                        chunk[3].should.equal(0x02);
                        chunk[4].should.equal(0x03);
                        chunk.length.should.equal(5);
                        break;
                    case 1:
                        chunk[0].should.equal(0x80);
                        chunk[1].should.equal(0x00);
                        chunk.length.should.equal(2);
                        done();
                        break;
                }

                counter++;
            });

            wssocket.stream(new Buffer([0x01, 0x02, 0x03]));
            wssocket.stream();
        });

        it('should stream two binary frames', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x02);
                        chunk[1].should.equal(0x03);
                        chunk[2].should.equal(0x01);
                        chunk[3].should.equal(0x02);
                        chunk[4].should.equal(0x03);
                        chunk.length.should.equal(5);
                        break;
                    case 1:
                        chunk[0].should.equal(0x00);
                        chunk[1].should.equal(0x03);
                        chunk[2].should.equal(0x04);
                        chunk[3].should.equal(0x05);
                        chunk[4].should.equal(0x06);
                        chunk.length.should.equal(5);
                        break;
                    case 2:
                        chunk[0].should.equal(0x00);
                        chunk[1].should.equal(0x03);
                        chunk[2].should.equal(0x07);
                        chunk[3].should.equal(0x08);
                        chunk[4].should.equal(0x09);
                        chunk.length.should.equal(5);
                        break;
                    case 3:
                        chunk[0].should.equal(0x80);
                        chunk[1].should.equal(0x00);
                        chunk.length.should.equal(2);
                        done();
                        break;
                }

                counter++;
            });

            wssocket.stream(new Buffer([0x01, 0x02, 0x03]));
            wssocket.stream(new Buffer([0x04, 0x05, 0x06]));
            wssocket.stream(new Buffer([0x07, 0x08, 0x09]));
            wssocket.stream();
        });

    });

});
