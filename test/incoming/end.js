var MockupSocket = require('../mockup/socket');
var WebSocketCore = require('../../lib/core');

describe('WebSocketIncoming', function() {

    var msocket, wscore, wssrequest;

    beforeEach(function() {
        msocket = new MockupSocket();
        wscore = new WebSocketCore(msocket, { useRequest: true });
    });

    describe('Event: "end"', function() {

        it('should be emitted on the end of frame', function(done) {
            wscore.once('request', function(request) {
                request.once('readable', function() {
                    request.read().should.eql(new Buffer('Hey'));
                });
                request.once('end', function() {
                    done();
                });
                request.push(null);
            });

            msocket.push(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]));
            msocket.push(new Buffer([0x82, 0x03, 0x01, 0x02, 0x03]));
        });

    });

});
