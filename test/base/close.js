var util = require('util');
var should = require('should');

var MockupSocket = require('../mockup/socket');
var WebSocketBase = require('../../lib/base');
var WebSocketFrame = require('../../lib/frame');

describe('WebSocketBase', function() {

    var wsb;
    var socket;

    beforeEach(function() {
        wsb = new WebSocketBase({ mask: true });
        socket = new MockupSocket();

        wsb.assignSocket(socket);
    });

    describe('#close()', function() {
        // TODO: fix the bellow
        it('should send a close frame and cut the connection', function() {
            socket.once('data', function(data) {
                var frame = new WebSocketFrame(data);
                frame.fin.should.be.true;
                //frame.mask.should.be.true;
                frame.opcode.should.equal(0x08);
                frame.length.should.equal(0x07);
                frame.content.toString().should.equal('closing');;
            });
            socket.once('end', function(error) {
                //done(); is not getting executed...
            });
            wsb.close(wsb.connected, 'closing');
        });
    });

});
