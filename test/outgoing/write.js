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

        it('should send first frame fragment', function(done) {
            var message = new Buffer('Hey');
            
            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x02);
                chunk[1].should.equal(0x03);
                chunk.slice(2).should.eql(message);
                done();
            });

            wsoutgoing.write(message);
        });

        it('should send two frame fragments', function(done) {
            var messageOne = new Buffer('Hello');
            var messageTwo = new Buffer('World');

            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x01);
                        chunk[1].should.equal(0x05);
                        chunk.slice(2).should.eql(messageOne);
                        break;
                    case 1:
                        chunk[0].should.equal(0x00);
                        chunk[1].should.equal(0x05);
                        chunk.slice(2).should.eql(messageTwo);
                        done();
                        break;
                }
                counter++;
            });

            wsoutgoing.opcode = 0x01;
            wsoutgoing.write(messageOne);
            wsoutgoing.write(messageTwo);
        });

    });

});
