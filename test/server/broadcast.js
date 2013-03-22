var MockupSocket = require('../mockup/socket');

var WebSocketFrame = require('../../lib/frame');
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
            msocketOne.once('data', function(data) {
                var wsframe = new WebSocketFrame(data);
                wsframe.fin.should.be.true;
                wsframe.mask.should.be.false;
                wsframe.opcode.should.equal(0x01);
                wsframe.length.should.equal(0x0d);
                wsframe.content.toString().should.equal('Hello Sockets');
            });
            msocketTwo.once('data', function(data) {
                var wsframe = new WebSocketFrame(data);
                wsframe.fin.should.be.true;
                wsframe.mask.should.be.false;
                wsframe.opcode.should.equal(0x01);
                wsframe.length.should.equal(0x0d);
                wsframe.content.toString().should.equal('Hello Sockets');
                done();
            });
            wsserver.broadcast('Hello Sockets');
        });
        it('should send a binary frame to both assinged sockets', function(done) {
            msocketOne.once('data', function(data) {
                var wsframe = new WebSocketFrame(data);
                wsframe.fin.should.be.true;
                wsframe.mask.should.be.false;
                wsframe.opcode.should.equal(0x02);
                wsframe.length.should.equal(0x03);
                wsframe.content.toString().should.equal('\u0001\u0002\u0003');
            });
            msocketTwo.once('data', function(data) {
                var wsframe = new WebSocketFrame(data);
                wsframe.fin.should.be.true;
                wsframe.mask.should.be.false;
                wsframe.opcode.should.equal(0x02);
                wsframe.length.should.equal(0x03);
                wsframe.content.toString().should.equal('\u0001\u0002\u0003');
                done();
            });
            wsserver.broadcast(new Buffer([0x01, 0x02, 0x03]));
        });
    });

});
