var net = require('net');
var should = require('should');

var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

var Socket = net.Socket;

describe('WebSocketSocket', function() {

    var sck, wss;

    beforeEach(function() {
        sck = new Socket();
        wss = new WebSocketSocket(sck);
    });

    describe('#close([reason])', function() {

        it('should throw an error if argument is not undefined or a string', function() {
            (function() {
                wss.close();
            }).should.not.throwError();
            (function() {
                wss.close({});
            }).should.throwError();
        });

        it('should send a close frame through the socket', function(done) {
            sck.once('data', function(buf) {
                var wsf = new WebSocketFrame(buf);

                wsf.opcode.should.equal(0x08);

                done();
            });

            wss.close();
        });

    });

});
