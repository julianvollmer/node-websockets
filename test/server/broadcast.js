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
            wsserver.broadcast({ fin: true, opcode: 0x01 }, new Buffer('Hey'));
        });

        it('should send a binary frame to both assinged sockets', function(done) {
            msocketOne.once('data', function(chunk) {
                chunk[0].should.equal(0x82);
                chunk[1].should.equal(0x02);
                chunk[2].should.equal(0x01);
                chunk[3].should.equal(0x02);
            });
            msocketTwo.once('data', function(chunk) {
                chunk[0].should.equal(0x82);
                chunk[1].should.equal(0x02);
                chunk[2].should.equal(0x01);
                chunk[3].should.equal(0x02);
                done();
            });
            wsserver.broadcast({ fin: true, opcode: 0x02 }, new Buffer([0x01, 0x02]));
        });
    
    });

});
