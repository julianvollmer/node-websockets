var net = require('net');
var should = require('should');

var mockupSocket = require('../mockup/frames');
var WebSocketSocket = require('../../lib/socket');

var Socket = net.Socket();

describe('WebSocketSocket', function() {

    var sck, wss;

    beforeEach(function() {
        sck = new Socket();
        wss = new WebSocketSocket(sck);
    });

    describe('open event', function(done) {
        wss.once('open', function() {
            done();
        });
        
        sck.assign(sck);
    });

    describe('text event', function(done) {
        wss.once('text', function(message) {
            message.should.equal('Hello');
            
            done();
        });

        sck.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
    });

    describe('binary event', function(done) {
        wss.once('binary', function(bin) {
            bin.toString().should.equal('Hello');
            
            done();
        });

        sck.write(new Buffer([0x82, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
    });

    describe('ping event', function(done) {
        wss.once('ping', function(payload) {
            payload.toString().should.equal('Hello');
            
            done();
        });

        sck.write(new Buffer([0x89, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
    });

    describe('close event', function(done) {
        wss.once('close', function(reason) {
            reason.toString().should.equal('Hello');
            
            done();
        });

        sck.write(new Buffer([0x88, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
    });

});
