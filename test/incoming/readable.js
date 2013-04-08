var MockupSocket = require('../mockup/socket');
var WebSocketCore = require('../../lib/core');

describe('WebSocketIncoming', function() {

    var msocket, wscore, wssrequest;

    beforeEach(function() {
        msocket = new MockupSocket();
        wscore = new WebSocketCore(msocket, { useRequest: true });
    });

    describe('Event: "readable"', function() {

        it('should be emitted on body chunk', function(done) {
            wscore.once('request', function(request) {
                request.on('readable', function() {
                    request.read().should.eql(new Buffer('Hey'));
                    done();
                });
            });

            msocket.push(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]));
        });

    });

});
