var should = require('should');

var MockupSocket = require('../mockup/socket');
var mockupExtensions = require('../mockup/extensions');

var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {

    var sck, opt, wss;

    beforeEach(function() {
        opt = { extensions: mockupExtensions };
        sck = new MockupSocket();
        wss = new WebSocketSocket(sck, opt);
    });

    describe('#write([opcode,] [buffer])', function() {

        it('should send a text frame through the socket', function(done) {
            sck.on('data', function(buf) {
                var wsf = new WebSocketFrame(buf);

                wsf.opcode.should.equal(0x01);
                wsf.content.toString().should.equal('Hello Worldbubutaja');

                done();
            });

            wss.write(0x01, new Buffer('Hello World'));
        });

        it('should send a binary frame through the socket', function(done) {
            var bin = new Buffer([0x01, 0x02, 0x03, 0x04]);

            sck.on('data', function(buf) {
                var wsf = new WebSocketFrame(buf);

                wsf.opcode.should.equal(0x02);
                wsf.content.toString().should.equal(bin.toString() + 'bubutaja');

                done();
            });

            wss.write(0x02, bin);
        });

        it('should send a pong frame through the socket', function(done) {
            sck.once('data', function(buf) {
                var wsf = new WebSocketFrame(buf);

                wsf.opcode.should.equal(0x0a);
                
                done();
            });

            wss.write(0x0a);
        });

    });

});

