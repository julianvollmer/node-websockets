var util = require('util');
var should = require('should');

var MockupSocket = require('../mockup/socket');
var mockupFrames = require('../mockup/frames');

var WebSocketBase = require('../../lib/base');

describe('WebSocketBase', function() {

    var wsb;
    var socket;

    beforeEach(function() {
        wsb = new WebSocketBase();
        socket = new MockupSocket();
    });

    describe('event: "open"', function() {
        it('should emit a open event on connection', function(done) {
            wsb.once('open', function() {
                done();
            });
            wsb.assignSocket(socket);
        });
    });
    
    describe('event: "pong"', function() {
        it('should emit a pong event when receiving a ping frame and give the content', function(done) {
            wsb.once('pong', function(message) {
                message.toString().should.equal('ping-pong');
                
                done(); 
            });
            wsb.assignSocket(socket);
            wsb.ping('ping-pong');
        });
    });
    
    describe('event: "close"', function() {
        it('should emit a close event when connection is closed', function(done) {    
            wsb.once('open', function(reason, sid) {
                wsb.close(reason, sid);
            });
            wsb.once('close', function() {
                done();
            });
            wsb.assignSocket(socket);
        });
        it('should emit a close event when a close frame is received', function(done) {
            wsb.once('close', function() {
                done();
            });
            wsb.assignSocket(socket);
            socket.write(mockupFrames.maskedCloseFrame.frame);
        });
    });
    
    describe('event: "custom"', function() {
        it('should emit a real event when listening on the sockets custom event', function(done) {
            wsb.once('open', function(sid) {
                wsb.sockets[sid].emit('custom', 'heartbeat', true);
            });
            wsb.once('heartbeat', function(someVal) {
                someVal.should.be.true;
                done();
            });
            wsb.assignSocket(socket);
        });
    });

    describe('event: "message"', function() {
        it('should be a message event emitted when getting a data frame', function(done) {
            wsb.once('message', function(message) {
                message.should.equal('nodejs is fucking great');
                done();
            });
            wsb.assignSocket(socket);
            wsb.send('nodejs is fucking great');
        });
    });
    
    xdescribe('event: "error"', function() {
         
    });

});
