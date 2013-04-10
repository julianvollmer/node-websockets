var MockupSocket = require('../mockup/socket');
var WebSocketCore = require('../../lib/core');
var WebSocketOutgoing = require('../../lib/outgoing');

describe('WebSocketOutgoing', function() {

    var msocket, wscore, wsoutgoing;

    beforeEach(function() {
        msocket = new MockupSocket();
        wscore = new WebSocketCore(msocket);
        wsoutgoing = new WebSocketOutgoing(wscore);
    });

    describe('#write([chunk])', function() {

        it('should send masked text frame', function(done) {
            var message = new Buffer('Hello');
            
            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x81);
                chunk[1].should.equal(0x85);
                
                var masking = chunk.slice(2, 6);
                var payload = chunk.slice(6);

                for (var i = 0; i < payload.length; i++)
                    (payload[i] ^ masking[i % 4]).should.eql(message[i]);

                done();
            });

            wsoutgoing.fin = true;
            wsoutgoing.mask = true;

            wsoutgoing.opcode = 0x01;
            wsoutgoing.length = 0x05;

            wsoutgoing.end(message);
        });

        it('should send first frame fragment', function(done) {
            var message = new Buffer('Hey');
            
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x02);
                        chunk[1].should.equal(0x03);
                        break;
                    case 1:
                        chunk.should.eql(message);
                        done();
                        break;
                }
                counter++;
            });

            wsoutgoing.fin = false;
            wsoutgoing.mask = false;

            wsoutgoing.opcode = 0x02;
            wsoutgoing.length = 0x03;

            wsoutgoing.end(message);
        });

    });

});
