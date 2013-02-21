var util = require('util');
var should = require('should');

var WebSocketBase = require('../../lib/base');
var WebSocketFrame = require('../../lib/frame');
var MockupSocket = require('../mockup/socket');

describe('WebSocketBase', function() {
    
    var wsb;
    var socket;

    beforeEach(function() {
        wsb = new WebSocketBase({ mask: true });
        socket = new MockupSocket();

        wsb.assignSocket(socket);
    });

    afterEach(function() {
        wsb = null;
        socket = null;
    });

    describe('#ping()', function() {
        it('should send a ping frame containing "pongy"', function(done) {
            socket.once('data', function(data) {
                var frame = new WebSocketFrame(data);
                if (frame.opcode == 0x09) {
                    frame.fin.should.be.true;
                    frame.mask.should.be.true;
                    frame.opcode.should.equal(0x09);
                    frame.length.should.equal(0x05);
                    frame.content.toString().should.equal('pongy');
                    done();
                }
            });
            wsb.ping('pongy');
        });
    });

});
