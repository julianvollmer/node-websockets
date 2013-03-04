var should = require('should');

var MockupSocket = require('../mockup/socket');
var WebSocketBase = require('../../lib/base');
var WebSocketFrame = require('../../lib/frame');

describe('WebSocketBase', function() {
    
    var str, wsb, socketOne, socketOneId, socketTwo, socketTwoId;

    beforeEach(function() {
        str = 'Hello World.';
        wsb = new WebSocketBase();
        socketOne = new MockupSocket();
        socketTwo = new MockupSocket();

        wsb.assignSocket(socketOne);
        wsb.assignSocket(socketTwo);

        socketOneId = wsb.socketsHistory[0];
        socketTwoId = wsb.socketsHistory[1];
    });

    describe('#send(data)', function() {
        it('should send a text frame to socket one and two', function(done) {
            socketOne.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c);
                frame.content.toString().should.equal(str);
            });
            socketTwo.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c);
                frame.content.toString().should.equal(str);
                done();
            });
            wsb.send(str);
        });
    });

    describe('#send(sid, data)', function(done) {
        it('should only send a text frame to socket two', function(done) {
            socketOne.once('data', function(chunk) {
                throw new should.AssertionError('only socketTwo should receive data');
            });
            socketTwo.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c);
                frame.content.toString().should.equal(str);
                done();
            });
            wsb.send(socketTwoId, str);
        });
    });

});
