var crypto = require('crypto');

var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Event: "message"', function() {
        
        it('should be emitted on empty text message', function(done) {
            wssocket.once('message', function(message) {
                message.length.should.equal(0);
                done();
            });

            msocket.write(new Buffer([0x81, 0x00]));
        });
        
        it('should be emitted on simple text message', function(done) {
            wssocket.once('message', function(message) {
                message.length.should.equal(3);
                message.should.equal('Hey');
                done();
            });

            msocket.write(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]));
        });

        it('should be emitted on extended text message', function(done) {
            var frameHead = new Buffer([0x81, 0x7e, 0x00, 0x7e]);
            var frameBody = crypto.randomBytes(126);
                
            wssocket.once('message', function(message) {
                message.should.equal(frameBody.toString());
                done();
            });

            msocket.write(Buffer.concat([frameHead, frameBody]));
        });

    });

});
