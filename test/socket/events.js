var should = require('should');

var MockupSocket = require('../mockup/socket');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {

    var sck, wss;

    beforeEach(function() {
        sck = new MockupSocket();
        wss = new WebSocketSocket(sck);
    });

    it('should emit an open event', function(done) {
        wss.once('open', function() {
            done();
        });
        
        wss.assign(sck);
    });

    it('should emit a text event', function(done) {
        wss.once('text', function(message) {
            message.should.equal('Hello');
            
            done();
        });

        sck.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
    });

    it('should emit a binary event', function(done) {
        wss.once('binary', function(bin) {
            bin.toString().should.equal('Hello');
            
            done();
        });

        sck.write(new Buffer([0x82, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
    });

    it('should emit a ping event', function(done) {
        wss.once('pong', function(payload) {
            payload.toString().should.equal('Hello');
            
            done();
        });

        sck.write(new Buffer([0x89, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
    });

    it('should emit a close event', function(done) {
        wss.once('close', function(reason) {
            reason.toString().should.equal('Hello');
            
            done();
        });

        sck.write(new Buffer([0x88, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
    });

});
