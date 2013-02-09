var assert = require('assert');

var WebSocketBase = require('../lib/base');
var WebSocketFrame = require('../lib/frame');

var eachFrame = require('./mockup/frames');
var MockupSocket = require('./mockup/socket');

describe('WebSocketBase', function() {
    
    describe('#send()', function() {
        var wsb = new WebSocketBase();
        var socket = new MockupSocket();
        
        wsb.assignSocket(socket);
        wsb.masked = true;
        
        it('should send a text frame containing "Hello World."', function(done) {
            socket.on('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                
                assert.strictEqual(true, frame.fin);
                assert.strictEqual(true, frame.mask);
                assert.strictEqual(0x01, frame.opcode);
                assert.strictEqual(0x0c, frame.length);
                assert.strictEqual('Hello World.', frame.payload.toString());
                
                done(); 
            });
            
            wsb.send('Hello World.');
        });
    });
    
    describe('#ping()', function() {
        var wsb = new WebSocketBase();
        var socket = new MockupSocket();
        
        wsb.assignSocket(socket);
        wsb.masked = false;
        
        it('should send a ping frame containing "pongy"', function(done) {
            socket.on('data', function(data) {
                var frame = new WebSocketFrame(data);
                
                if (frame.opcode == 0x09) {
                    assert.equal(true, frame.fin);
                    assert.equal(false, frame.mask);
                    assert.equal(0x09, frame.opcode);
                    assert.equal(0x05, frame.length);
                    assert.equal('pongy', frame.payload.toString());
                    
                    done();
                }
            });
            
            wsb.ping('pongy');
        });
    });
    
    describe('#close()', function() {
        var wsb = new WebSocketBase();
        var socket = new MockupSocket();
        
        wsb.masked = true;
        wsb.assignSocket(socket);
        
        // TODO: fix the bellow
        it('should send a close frame and cut the connection', function() {
            socket.on('data', function(data) {
                var frame = new WebSocketFrame(data);
                
                assert.equal(true, frame.fin);
                assert.equal(true, frame.mask);
                assert.equal(0x08, frame.opcode);
                assert.equal(0x07, frame.length);
                assert.equal('closing', frame.payload.toString());
            });
            socket.on('end', function(error) {
                //done(); is not getting executed...
            });
            
            wsb.close('closing');
        });
    });
    
    describe('event: "open"', function() {
        var wsb = new WebSocketBase();
        var socket = new MockupSocket();
        
        it('should emit a open event on connection', function(done) {
            wsb.on('open', function() {
                done();
            });
            
            wsb.assignSocket(socket);
        });
    });
    
    describe('event: "pong"', function() {
        var wsb = new WebSocketBase();
        var socket = new MockupSocket();
        
        wsb.assignSocket(socket);
        wsb.masked = true;
        
        it('should emit a pong event when receiving a ping frame and give the content', function(done) {
            wsb.on('pong', function(message) {
                assert.equal('ping-pong', message);
                
                done(); 
            });
            
            wsb.ping('ping-pong');
        });
    });
    
    describe('event: "close"', function() {
        var wsb = new WebSocketBase();
        var socket = new MockupSocket();
        
        wsb.masked = true;
        wsb.assignSocket(socket);
    });
    
    describe('event: "message"', function() {
        var wsb = new WebSocketBase();
        var socket = new MockupSocket();
        
        wsb.masked = true;
        wsb.assignSocket(socket);
        
        it('should be a message event emitted when getting a data frame', function(done) {
            wsb.on('message', function(message) {
                assert.equal('nodejs is fucking great', message);
                done();
            });
            
            wsb.send('nodejs is fucking great');
        });
    });
    
    describe('event: "error"', function() {
         
    });

});