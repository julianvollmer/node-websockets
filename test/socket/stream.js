var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Event: "stream:start"', function() {

        it('should be emitted on start of frame stream', function(done) {
            wssocket.once('stream:start', function() {
                done();
            });

            msocket.push(new Buffer([0x02, 0x01, 0x48]));
        });

    });

    describe('Event: "stream:end"', function() {

        it('should be emitted on end of frame stream', function(done) {
            wssocket.once('stream:start', function() {
                wssocket.once('readable', function() {
                    wssocket.read().should.eql(new Buffer('Hey'));
                });
            });
            
            wssocket.once('stream:end', function() {
                done();
            });

            msocket.push(new Buffer([0x02, 0x01, 0x48]));
            msocket.push(new Buffer([0x00, 0x01, 0x65]));
            msocket.push(new Buffer([0x80, 0x01, 0x79]));
        });

    });

});
