var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('#pipe(destination)', function() {

        // the final frame is send before the other data
        // the source of this issue is that "done" on wsstream
        // is emitted before the actuall piping was done
        xit('should write incoming data to socket', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x02);
                        chunk[1].should.equal(0x01);
                        chunk[2].should.equal(0x48);
                        chunk.length.should.equal(3);
                        break;
                    case 1:
                        chunk[0].should.equal(0x00);
                        chunk[1].should.equal(0x01);
                        chunk[2].should.equal(0x65);
                        chunk.length.should.equal(3);
                        break;
                    case 2:
                        chunk[0].should.equal(0x00);
                        chunk[1].should.equal(0x01);
                        chunk[2].should.equal(0x79);
                        chunk.length.should.equal(3);
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

            wssocket.once('stream:start', function() {
                wssocket.pipe(wssocket);
            });
            wssocket.once('stream:end', function() {
                wssocket.unpipe(wssocket);
            });

            msocket.push(new Buffer([0x02, 0x01, 0x48]));
            msocket.push(new Buffer([0x00, 0x01, 0x65]));
            msocket.push(new Buffer([0x80, 0x01, 0x79]));
        });

    });

});
