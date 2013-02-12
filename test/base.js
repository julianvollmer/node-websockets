var util = require('util');
var should = require('should');

var WebSocketBase = require('../lib/base');
var WebSocketFrame = require('../lib/frame');

var eachFrame = require('./mockup/frames');
var MockupSocket = require('./mockup/socket');

var format = util.format;

describe('WebSocketBase', function() {
    
    describe('#constructor()', function() {
        it('should set ws://localhost:3000 as default url', function() {
            var wsb = new WebSocketBase();
            
            wsb.url.should.be.a('object');
            wsb.url.slashes.should.be.true;
            wsb.url.protocol.should.equal('ws:');
            wsb.url.hostname.should.equal('localhost');
            wsb.url.href.should.equal('ws://localhost:3000');
            wsb.url.host.should.equal('localhost:3000');
            wsb.url.port.should.equal('3000');
            wsb.url.path.should.equal('/');
        });
        
        it('should use the url defined in options if provided', function() {
            var wsb = new WebSocketBase({ url: "ws://sockets.org:5000/index" });
            
            wsb.url.should.be.a('object');
            wsb.url.slashes.should.be, true;
            wsb.url.protocol.should.equal('ws:');
            wsb.url.hostname.should.equal('sockets.org');
            wsb.url.href.should.equal('ws://sockets.org:5000/index');
            wsb.url.host.should.equal('sockets.org:5000');
            wsb.url.port.should.equal('5000');
            wsb.url.path.should.equal('/index');            
        });
    });
    
    describe('#send()', function() {
        var wsb = new WebSocketBase();
        var socket = new MockupSocket();
        
        wsb.assignSocket(socket);
        wsb.masked = true;
        
        it(format('should send a text frame containing "%s"', 'Hello World.'), function(done) {
            socket.on('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                
                frame.fin.should.be.true;
                frame.mask.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c);
                frame.payload.toString().should.equal('Hello World.');
                
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
                    frame.fin.should.be.true;
                    frame.mask.should.be.false;
                    frame.opcode.should.equal(0x09);
                    frame.length.should.equal(0x05);
                    frame.payload.toString().should.equal('pongy');
                    
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
                
                frame.fin.should.be.true;
                frame.mask.should.be.true;
                frame.opcode.should.equal(0x08);
                frame.length.should.equal(0x07);
                frame.payload.toString().should.equal('closing');;
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
                message.toString().should.equal('ping-pong');
                
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
                message.should.equal('nodejs is fucking great');
                
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
                        mess.should.be.a('string');
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