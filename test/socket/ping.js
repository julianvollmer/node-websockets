var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('#ping([message])', function() {
        
        it('should send an empty ping', function(done) {
            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x89);
                chunk[1].should.equal(0x00);
                chunk.length.should.equal(2);
                done();
            });

            wssocket.ping();
        });

        it('should send a small ping', function(done) {
            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x89);
                chunk[1].should.equal(0x0b);
                chunk.slice(2).should.eql(new Buffer('Hello World'));
                done();
            });

            wssocket.ping('Hello World');
        });

        it('should send a middle ping message', function(done) {
            var message = '';
            message += 'This is a middle-sized message which ';
            message += 'should have a length of 126 so that ';
            message += 'the there should be two length bytes ';
            message += 'which follow the two first head bytes';

            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x89);
                chunk[1].should.equal(0x7e);
                chunk[2].should.equal(0x00);
                chunk[3].should.equal(0x93);
                chunk.slice(4).should.eql(new Buffer(message));
                done();
            });

            wssocket.ping(message);
        });

    });

});
