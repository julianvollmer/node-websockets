var should = require('should');

var MockupSocket = require('../mockup/socket');
var mockupExtensions = require('../mockup/extensions');

var WebSocketBase = require('../../lib/base');
var WebSocketFrame = require('../../lib/frame');

describe('WebSocketBase', function() {
    
    var str, wsb, options, socketOne, socketOneId, socketTwo, socketTwoId;

    beforeEach(function() {
        str = 'Hello World.';

        wsb = new WebSocketBase();
        socketOne = new MockupSocket();
        socketTwo = new MockupSocket();

        options = { extensions: Object.keys(mockupExtensions) };

        wsb.extensions = mockupExtensions;
        wsb.assignSocket(socketOne, options);
        wsb.assignSocket(socketTwo, options);

        socketOneId = wsb.socketsHistory[0];
        socketTwoId = wsb.socketsHistory[1];
    });

    describe('#send(data) with two extensions', function() {
        it('should send a text frame to socket one and two', function(done) {
            socketOne.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c + 8);
                frame.content.toString().should.equal(str + 'bubutaja');
            });
            socketTwo.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c + 8);
                frame.content.toString().should.equal(str + 'bubutaja');
                done();
            });
            wsb.send(str);
        });
    });

    describe('#send(sid, data) with two extensions', function(done) {
        it('should only send a text frame to socket two', function(done) {
            socketOne.once('data', function(chunk) {
                throw new should.AssertionError('only socketTwo should receive data');
            });
            socketTwo.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c + 8);
                frame.content.toString().should.equal(str + 'bubutaja');
                done();
            });
            wsb.send(socketTwoId, str);
        });
    });

});

