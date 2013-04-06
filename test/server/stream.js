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

            wsserver.once('stream:start', function(wssocket) {
                wssocket.should.be.an.instanceOf(WebSocket);
                done();
            });

            msocket.write(new Buffer([0x02, 0x01, 0xff]));
        });

    });

    describe('Event: "stream:stop"', function() {

        it('should be emitted on end of frame stream', function(done) {
            wsserver.assignSocket(msocket);

            wsserver.once('stream:start', function(wssocket) {
                wssocket.should.be.an.instanceOf(WebSocket);
                done();
            });

            msocket.write(new Buffer([0x02, 0x01, 0xff]));
            msocket.write(new Buffer([0x80, 0x01, 0xbb]));
        });

    });

});
