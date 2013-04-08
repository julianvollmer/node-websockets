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
            msocket.on('data', function(chunk) {
                chunk[0].should.equal(0x82);
                chunk[1].should.equal(0x00);
                chunk.length.should.equal(2);
                done();
            });

            wsoutgoing.end();
        });

        it('should send fragment with final frame', function(done) {
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
                        break;
                    case 2:
                        chunk[0].should.equal(0x80);
                        chunk[1].should.equal(0x00);
                        chunk.length.should.equal(2);
                        done();
                        break;
                }
                counter++;
            });

            wsoutgoing.opcode = 0x01;
            wsoutgoing.write(messageOne);
            wsoutgoing.end(messageTwo);
        });

    });

});
