var util = require('util');
var assert = require('assert');

var WebSocketBase = require('../lib/base');
var WebSocketFrame = require('../lib/frame');

var eachFrame = require('./mockup/frames');
var MockupSocket = require('./mockup/socket');

var format = util.format;

describe('WebSocketBase', function() {
    
    describe('#constructor()', function() {
        it('should set ws://localhost:3000 as default url', function() {
            var wsb = new WebSocketBase();
            
            assert.equal(wsb.url.slashes, true);
            assert.equal(wsb.url.protocol, 'ws:');
            assert.equal(wsb.url.hostname, 'localhost');
            assert.equal(wsb.url.href, 'ws://localhost:3000');
            assert.equal(wsb.url.host, 'localhost:3000');
            assert.equal(wsb.url.port, '3000');
            assert.equal(wsb.url.path, '/');
        });
        
        it('should use the url defined in options if provided', function() {
            var wsb = new WebSocketBase({ url: "ws://sockets.org:5000/index" });
            
            assert.equal(wsb.url.slashes, true);
            assert.equal(wsb.url.protocol, 'ws:');
            assert.equal(wsb.url.hostname, 'sockets.org');
            assert.equal(wsb.url.href, 'ws://sockets.org:5000/index');
            assert.equal(wsb.url.host, 'sockets.org:5000');
            assert.equal(wsb.url.port, '5000');
            assert.equal(wsb.url.path, '/index');            
        });
    });
    
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
    
    
    eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
        it(format('should handle %s frame properly', name), function(done) {
            var wsb = new WebSocketBase();
            var socket = new MockupSocket();
            
            wsb.masked = true;
            wsb.assignSocket(socket);
            
            switch (opcode) {
                case 0x01:
                    wsb.on('message', function(mess) {
                        assert.equal(typeof mess, 'string');
                        done();
                    });
                    
                    socket.write(frame);
                    
                    break;
                
                case 0x08:
                    wsb.on('close', function(reason) {
                       done(); 
                    });
                    
                    socket.write(frame);
                    
                    break;
                    
                case 0x09:
                    wsb.on('pong', function(mess) {
                        done(); 
                    });
                    
                    socket.write(frame);
                    
                    break;
                    
                default:
                    socket.write(frame);
                    
                    done();
                    
                    break;
            }
        });
    });

});