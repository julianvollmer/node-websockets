var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('#send([message])', function() {
        
        it('should send an empty message', function(done) {
            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x81);
                chunk[1].should.equal(0x00);
                chunk.length.should.equal(2);
                done();
            });

            wssocket.send();
        });

        it('should send a short text message', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x81);
                        chunk[1].should.equal(0x0b);
                        chunk.length.should.equal(2);
                        break;
                    case 1:
                        chunk.should.eql(new Buffer('Hello World'));
                        done();
                        break;
                }
                counter++;
            });

            wssocket.send('Hello World');
        });

        it('should send a middle text message', function(done) {
            var message = '';
            message += 'This is a middle-sized message which ';
            message += 'should have a length of 126 so that ';
            message += 'the there should be two length bytes ';
            message += 'which follow the two first head bytes';

            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x81);
                        chunk[1].should.equal(0x7e);
                        chunk[2].should.equal(0x00);
                        chunk[3].should.equal(0x93);
                        chunk.length.should.equal(4);
                        break;
                    case 1:
                        chunk.should.eql(new Buffer(message));
                        done();
                        break;
                }
                counter++;
            });

            wssocket.send(message);
        });

    });

});
