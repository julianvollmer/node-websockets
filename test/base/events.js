var util = require('util');
var should = require('should');

var MockupSocket = require('../mockup/socket');
var WebSocketBase = require('../../lib/base');

describe('WebSocketBase', function() {

    var wsb;
    var socket;

    beforeEach(function() {
        wsb = new WebSocketBase();
        socket = new MockupSocket();

        wsb.assignSocket(socket);
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
            wsb.ping('ping-pong');
        });
    });
    
    xdescribe('event: "close"', function() {
 
    });
    
    describe('event: "message"', function() {
        it('should be a message event emitted when getting a data frame', function(done) {
            wsb.once('message', function(message) {
                message.should.equal('nodejs is fucking great');
                
                done();
            });
            wsb.send('nodejs is fucking great');
        });
    });
    
    xdescribe('event: "error"', function() {
         
    });

});
