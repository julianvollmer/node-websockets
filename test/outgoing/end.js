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

    describe('#end([chunk])', function() {

        it('should send empty final frame', function(done) {
            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x82);
                chunk[1].should.equal(0x00);
                chunk.length.should.equal(2);
                done();
            });

            wsoutgoing.fin = true;
            wsoutgoing.length = 0;
            wsoutgoing.end();
        });

        it('should send frame part for part', function(done) {
            var messageOne = new Buffer('Hello');
            var messageTwo = new Buffer('World');

            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x01);
                        chunk[1].should.equal(0x0a);
                        break;
                    case 1:
                        chunk.should.eql(messageOne);
                        break;
                    case 2:
                        chunk.should.eql(messageTwo);
                        done();
                        break;
                }
                counter++;
            });

            wsoutgoing.opcode = 0x01;
            wsoutgoing.length = 0x0a;
            wsoutgoing.write(messageOne);
            wsoutgoing.end(messageTwo);
        });

    });

});
