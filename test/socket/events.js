var MockupSocket = require('../mockup/socket');
var mockupExtensions = require('../mockup/extensions');

var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {

    var msocket, wssocket;

    describe('Events:', function() {

        beforeEach(function() {
            msocket = new MockupSocket();
            wssocket = new WebSocketSocket(msocket);
        });

        it('should emit an open event', function(done) {
            wssocket.once('open', function() {
                done();
            });
            wssocket.assign(msocket);
        });

        it('should emit a message event', function(done) {
            wssocket.once('message', function(message) {
                message.should.equal('Hello');
                done();
            });
            msocket.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
        });

        it('should emit a message event', function(done) {
            wssocket.once('message', function(binary) {
                binary.toString().should.equal('Hello');
                done();
            });
            msocket.write(new Buffer([0x82, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
        });

        it('should emit a pong event', function(done) {
            wssocket.once('pong', function(payload) {
                payload.toString().should.equal('Hello');
                done();
            });
            msocket.write(new Buffer([0x89, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
        });

        it('should emit a close event', function(done) {
            wssocket.once('close', function(reason) {
                reason.toString().should.equal('Hello');
                done();
            });
            msocket.write(new Buffer([0x88, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
        });

    });

    describe('Events with extensions:', function() {

        beforeEach(function() {
            msocket = new MockupSocket();
            wssocket = new WebSocketSocket(msocket, { extensions: mockupExtensions });
        });
        
        it('should emit a message event', function(done) {
            wssocket.once('message', function(message) {
                message.should.equal('Hellobubutaja');
                done();
            });
            msocket.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
        });

        it('should emit a message event', function(done) {
            wssocket.once('message', function(buff) {
                buff.toString().should.equal('Hellobubutaja'); 
                done();
            });
            msocket.write(new Buffer([0x82, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
        });

        it('should emit a pong event', function(done) {
            wssocket.once('pong', function(payload) {
                payload.toString().should.equal('Hello');
                done();
            });
            msocket.write(new Buffer([0x89, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
        });

        it('should emit a close event', function(done) {
            wssocket.once('close', function(reason) {
                reason.toString().should.equal('Hello');
                done();
            });
            msocket.write(new Buffer([0x88, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
        });

    });

});
