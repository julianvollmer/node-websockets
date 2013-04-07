var MockupSocket = require('../mockup/socket');
var WebSocketStream = require('../../lib/stream');

describe('WebSocketIncoming', function() {

    var msocket, wsstream, wssrequest;

    beforeEach(function() {
        msocket = new MockupSocket();
        wsstream = new WebSocketStream(msocket, { useRequest: true });
    });

    describe('Event: "readable"', function() {

        it('should be emitted on body chunk', function(done) {
            wsstream.once('request', function(request) {
                request.on('readable', function() {
                    request.read().should.eql(new Buffer('Hey'));
                    done();
                });
            });

            msocket.push(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]));
        });

    });

});
