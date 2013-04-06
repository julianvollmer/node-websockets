var crypto = require('crypto');

var WebSocket = require('../../lib/socket');
var WebSocketServer = require('../../lib/server');
var MockupSocket = require('../mockup/socket');

describe('WebSocketServer', function() {

    var msocket, wsserver;

    beforeEach(function() {
        msocket = new MockupSocket();
        wsserver = new WebSocketServer(msocket);
    });

    describe('Event: "stream:start"', function() {

        it('should be emitted on begin of frame stream', function(done) {
            wsserver.assignSocket(msocket);

            wsserver.once('stream:start', function(message, wssocket) {
                message.should.equal('Hello');
                wssocket.should.be.an.instanceOf(WebSocket);
                done();
            });

            msocket.write(new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]));
        });

    });

});
