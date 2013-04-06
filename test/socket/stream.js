var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Event: "stream:start"', function() {

        it('should be emitted when a stream starts', function(done) {
            wssocket.once('stream:start', function() {
                done();  
            });

            msocket.push(new Buffer([0x02, 0x01, 0x48]));
        });

    });

    describe('Event: "stream:end"', function() {

        it('should be emitted when a stream stops', function(done) {
            msocket.push(new Buffer([0x02, 0x01, 0x48]));
            msocket.push(new Buffer([0x00, 0x01, 0x65]));

            wssocket.once('stream:end', function() {
                done();  
            });
            
            msocket.push(new Buffer([0x80, 0x01, 0x79]));
        });

    });

});
