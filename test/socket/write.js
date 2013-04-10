var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('#write([chunk])', function() {

        it('should stream an empty binary', function(done) {
            msocket.on('data', function(chunk) {
                chunk[0].should.equal(0x82);
                chunk[1].should.equal(0x00);
                chunk.length.should.equal(2);
                done();
            });

            wssocket.write(new Buffer(0));
        });

        it('should stream two binary frames', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x02);
                        chunk[1].should.equal(0x03);
                        chunk.length.should.equal(2);
                        break;
                    case 1:
                        chunk[0].should.equal(0x01);
                        chunk[1].should.equal(0x02);
                        chunk[2].should.equal(0x03);
                        chunk.length.should.equal(3);
                        break;
                    case 2:
                        chunk[0].should.equal(0x80);
                        chunk[1].should.equal(0x00);
                        chunk.length.should.equal(2);
                        done();
                        break;
                }

                counter++;
            });

            wssocket.write(new Buffer([0x01, 0x02, 0x03]));
            wssocket.write(new Buffer(0));
        });

        it('should stream two binary frames', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x02);
                        chunk[1].should.equal(0x03);
                        chunk.length.should.equal(2);
                        break;
                    case 1:
                        chunk[0].should.equal(0x01);
                        chunk[1].should.equal(0x02);
                        chunk[2].should.equal(0x03);
                        chunk.length.should.equal(3);
                        break;
                    case 2:
                        chunk[0].should.equal(0x00);
                        chunk[1].should.equal(0x03);
                        chunk.length.should.equal(2);
                        break;
                    case 3:
                        chunk[0].should.equal(0x04);
                        chunk[1].should.equal(0x05);
                        chunk[2].should.equal(0x06);
                        chunk.length.should.equal(3);
                        break;
                    case 4:
                        chunk[0].should.equal(0x00);
                        chunk[1].should.equal(0x03);
                        chunk.length.should.equal(2);
                        break;
                    case 5:
                        chunk[0].should.equal(0x07);
                        chunk[1].should.equal(0x08);
                        chunk[2].should.equal(0x09);
                        chunk.length.should.equal(3);
                        break;
                    case 6:
                        chunk[0].should.equal(0x80);
                        chunk[1].should.equal(0x00);
                        chunk.length.should.equal(2);
                        done();
                        break;
                }

                counter++;
            });

            wssocket.write(new Buffer([0x01, 0x02, 0x03]));
            wssocket.write(new Buffer([0x04, 0x05, 0x06]));
            wssocket.write(new Buffer([0x07, 0x08, 0x09]));
            wssocket.write(new Buffer(0));
        });

    });

});
