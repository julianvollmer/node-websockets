var util = require('util');

var MockupSocket = require('../mockup/socket');
var mockupFrames = require('../mockup/frames');

var WebSocketBase = require('../../lib/base');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketBase', function() {

    var wsbase, msocket;

    beforeEach(function() {
        wsbase = new WebSocketBase();
        msocket = new MockupSocket();
    });

    describe('event: "open"', function() {
        it('should emit a open event on connection', function(done) {
            wsbase.once('open', function(socket) {
                socket.should.be.an.instanceOf(WebSocketSocket);
                done();
            });
            wsbase.assignSocket(msocket);
        });
    });
    
    describe('event: "pong"', function() {
        it('should emit a pong event when receiving a ping frame and give the content', function(done) {
            wsbase.once('open', function(socket) {
                socket.ping('ping-pong');
            });
            wsbase.once('pong', function(message, socket) {
                socket.should.be.an.instanceOf(WebSocketSocket);
                message.toString().should.equal('ping-pong');
                done(); 
            });
            wsbase.assignSocket(msocket);
        });
    });
    
    describe('event: "close"', function() {
        it('should emit a close event when connection is closed', function(done) {    
            wsbase.once('open', function(socket) {
                socket.should.be.an.instanceOf(WebSocketSocket);
                socket.close();
            });
            wsbase.once('close', function() {
                done();
            });
            wsbase.assignSocket(msocket);
        });
        it('should emit a close event when a close frame is received', function(done) {
            wsbase.once('open', function(socket) {
                socket.close();
            });
            wsbase.once('close', function() {
                done();
            });
            wsbase.assignSocket(msocket);
        });
    });
    
    describe('event: "custom"', function() {
        it('should emit a real event when listening on the sockets custom event', function(done) {
            wsbase.once('open', function(socket) {
                socket.emit('custom', 'heartbeat', true);
            });
            wsbase.once('heartbeat', function(someVal) {
                someVal.should.be.true;
                done();
            });
            wsbase.assignSocket(msocket);
        });
    });

    describe('event: "message"', function() {
        it('should be a message event emitted when getting a data frame', function(done) {
            wsbase.once('open', function(socket) {
                socket.send('nodejs is so fucking great');
            });
            wsbase.once('message', function(message, socket) {
                socket.should.be.an.instanceOf(WebSocketSocket);
                message.should.equal('nodejs is so fucking great');
                done();
            });
            wsbase.assignSocket(msocket);
        });
    });
    
    xdescribe('event: "error"', function() {
         
    });

});
