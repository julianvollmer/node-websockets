var MockupSocket = require('../mockup/socket');
var WebSocketServer = require('../../lib/server');

describe('WebSocketServer', function() {

    var wsserver, msocketOne, msocketTwo;

    beforeEach(function() {
        msocketOne = new MockupSocket();
        msocketTwo = new MockupSocket();
        wsserver = new WebSocketServer();
        wsserver.assignSocket(msocketOne);
        wsserver.assignSocket(msocketTwo);
    });

    describe('#broadcast(message)', function() {

        it('should send a text frame to both assigned sockets', function(done) {
            var counterOne = 0;
            msocketOne.on('data', function(chunk) {
                switch (counterOne) {
                    case 0:
                        chunk[0].should.equal(0x81);
                        chunk[1].should.equal(0x03);
                        chunk.length.should.equal(2);
                        break;
                    case 1:
                        chunk[0].should.equal(0x48);
                        chunk[1].should.equal(0x65);
                        chunk[2].should.equal(0x79);
                        chunk.length.should.equal(3);
                        break;
                }
                counterOne++;
            });

            var counterTwo = 0;
            msocketTwo.on('data', function(chunk) {
                switch (counterTwo) {
                    case 0:
                        chunk[0].should.equal(0x81);
                        chunk[1].should.equal(0x03);
                        chunk.length.should.equal(2);
                        break;
                    case 1:
                        chunk[0].should.equal(0x48);
                        chunk[1].should.equal(0x65);
                        chunk[2].should.equal(0x79);
                        chunk.length.should.equal(3);
                        done();
                        break;
                }
                counterTwo++;
            });

            wsserver.broadcast('Hey');
        });
    
    });

});
