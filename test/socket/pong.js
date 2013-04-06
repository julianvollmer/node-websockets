var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Event: "pong"', function() {

        it('should be emitted on empty pong', function(done) {
            wssocket.once('pong', function(message) {
                message.length.should.equal(0);
                done();
            });

            msocket.push(new Buffer([0x8a, 0x00]));
        });

        it('should be emitted on simple pong', function(done) {
            wssocket.once('pong', function(message) {
                message.should.eql(new Buffer('Hey'));
                done();
            });

            msocket.push(new Buffer([0x8a, 0x03, 0x48, 0x65, 0x79]));
        });

    });

});
