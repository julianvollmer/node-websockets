var MockupSocket = require('../mockup/socket');

var WebSocketBase = require('../../lib/base');
var WebSocketFrame = require('../../lib/frame');

describe('WebSocketBase', function() {
    
    var str, wsbase, socketOne, socketTwo, socketThree;

    beforeEach(function() {
        str = 'Hello World.';

        socketOne = new MockupSocket();
        socketTwo = new MockupSocket();
        socketThree = new MockupSocket();
    });

    describe('#assignSocket(socket)', function() {
        it('should close the first added socket if maxConnections reached', function(done) {
            wsbase = new WebSocketBase({ maxConnections: 1 });
            socketOne.once('data', function(data) {
                var wsf = new WebSocketFrame(data);
                wsf.opcode.should.equal(0x08);
            });
            socketTwo.once('data', function(data) {
                var wsf = new WebSocketFrame(data);
                wsf.opcode.should.equal(0x01);
                done();
            });
            wsbase.assignSocket(socketOne);
            wsbase.assignSocket(socketTwo);
            wsbase.sockets[1].send('blabla');
        });
    });

});
