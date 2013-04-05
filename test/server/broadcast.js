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
            msocketOne.once('data', function(chunk) {
                chunk[0].should.equal(0x81);
                chunk[1].should.equal(0x03);
                chunk[2].should.equal(0x48);
                chunk[3].should.equal(0x65);
                chunk[4].should.equal(0x79);
            });
            msocketTwo.once('data', function(chunk) {
                chunk[0].should.equal(0x81);
                chunk[1].should.equal(0x03);
                chunk[2].should.equal(0x48);
                chunk[3].should.equal(0x65);
                chunk[4].should.equal(0x79);
                done();
            });
            wsserver.broadcast('Hey');
        });
    
    });

});
