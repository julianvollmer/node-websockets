var net = require('net');
var util = require('util');
var should = require('should');

var mockupFrames = require('../mockup/frames');
var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

var Socket = net.Socket;

describe('WebSocketSocket', function() {

    var sck, wss;

    beforeEach(function() {
        sck = new Socket();
        wss = new WebSocketSocket(socket);
    });

    describe('#write([str, buf])', function() {

        it('should throw an error on wrong argument type', function() {
            (function() {
                wss.write(500);
            }).should.throwError();
            (function() {
                wss.write(function() {});
            }).should.throwError();
        });

        it('should send a text frame through the socket', function(done) {
            sck.on('data', function(buf) {
                var wsf = new WebSocketFrame(buf);

                wsf.opcode.should.equal(0x01);
                wsf.content.toString().should.equal('Hello World');

                done();
            });

            wss.write('Hello World');
        });

        it('should send a binary frame through the socket', function() {
            var bin = new Buffer([0x01, 0x02, 0x03, 0x04]);

            sck.on('data', function(buf) {
                var wsf = new WebSocketFrame(buf);

                wsf.opcode.should.equal(0x02);
                wsf.content.toString().should.equal(bin.toString());

                done();
            });

            wss.write(bin);
        });

    });

});
