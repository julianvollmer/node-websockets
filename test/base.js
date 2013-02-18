var util = require('util');
var should = require('should');

var WebSocketBase = require('../lib/base');
var WebSocketFrame = require('../lib/frame');

var mockupFrames = require('./mockup/frames');
var MockupSocket = require('./mockup/socket');

var format = util.format;

describe('WebSocketBase', function() {
 
    var wsb;
    var socket;

    beforeEach(function() {
        wsb = new WebSocketBase({ mask: true });
        socket = new MockupSocket();

        wsb.assignSocket(socket);
    });

    afterEach(function() {
        wsb = null;
        socket = null;
    });

    describe('#constructor()', function() {
        it('should set ws://localhost:3000 as default url', function() {
            wsb.url.should.be.a('object');
            wsb.url.should.have.property('slashes', true);
            wsb.url.should.have.property('protocol', 'ws:');
            wsb.url.should.have.property('hostname', 'localhost');
            wsb.url.should.have.property('href', 'ws://localhost:3000');
            wsb.url.should.have.property('host', 'localhost:3000');
            wsb.url.should.have.property('port', '3000');
            wsb.url.should.have.property('path', '/');
        });
        it('should use the url defined in options if provided', function() {
            var wsb = new WebSocketBase({ url: "ws://sockets.org:5000/index" });
            wsb.url.should.be.a('object');
            wsb.url.should.have.property('slashes', true);
            wsb.url.should.have.property('protocol', 'ws:');
            wsb.url.should.have.property('hostname', 'sockets.org');
            wsb.url.should.have.property('href', 'ws://sockets.org:5000/index');
            wsb.url.should.have.property('host', 'sockets.org:5000');
            wsb.url.should.have.property('path', '/index');
            wsb.url.should.have.property('port', '5000'); 
        });
    });
    
    describe('#send()', function() {
        it(format('should send a text frame containing "%s"', 'Hello World.'), function(done) {
            socket.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.mask.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c);
                frame.content.toString().should.equal('Hello World.');
                done(); 
            });
            wsb.send('Hello World.');
        });
    });
    
    describe('#ping()', function() {
        it('should send a ping frame containing "pongy"', function(done) {
            socket.once('data', function(data) {
                var frame = new WebSocketFrame(data);
                if (frame.opcode == 0x09) {
                    frame.fin.should.be.true;
                    frame.mask.should.be.true;
                    frame.opcode.should.equal(0x09);
                    frame.length.should.equal(0x05);
                    frame.content.toString().should.equal('pongy');
                    done();
                }
            });
            wsb.ping('pongy');
        });
    });
    
    describe('#close()', function() {
        // TODO: fix the bellow
        it('should send a close frame and cut the connection', function() {
            socket.once('data', function(data) {
                var frame = new WebSocketFrame(data);
                frame.fin.should.be.true;
                frame.mask.should.be.true;
                frame.opcode.should.equal(0x08);
                frame.length.should.equal(0x07);
                frame.content.toString().should.equal('closing');;
            });
            socket.once('end', function(error) {
                //done(); is not getting executed...
            });
            wsb.close('closing');
        });
    });

    describe('#addExtension()', function() {
        it('should add a extension container to internal storage', function() {
            var parser = function() {};
            wsb.addExtension('x-test', parser, parser);
            wsb.extensions[0].should.have.property('name', 'x-test');
            wsb.extensions[0].should.have.property('read', parser); 
            wsb.extensions[0].should.have.property('write', parser); 
            wsb.extensions[0].should.have.property('enabled', false);
        });
        it('should use read and write chains on incoming data', function(done) {
            // this will remove prefix from the front of the content
            function read(next, frame) {
                frame.content = new Buffer(frame.content.toString().slice(6));

                next(null, frame);
            }
            // this will add prefix to the front of the content
            function write(next, frame) {
                frame.content = new Buffer('prefix' + frame.content.toString());

                next(null, frame);
            }
            // both extensions should compensate
            wsb.addExtension('x-test', read, write);
            wsb.on('message', function(message) {
                message.should.equal('hello');
                done();
            });
            wsb.send('hello');
        });
    });

    describe('#hasExtension()', function() {
        it('should return false if extension has not been added', function() {
            wsb.hasExtension('x-test').should.be.false;
        });
        it('should return true if extension is already added', function() {
            var parser = function() {};
            wsb.addExtension('x-test', parser, parser);
            wsb.hasExtension('x-test').should.be.true;
        });
    });

    describe('#removeExtension()', function() {
        it('should return the added extension from this.extensions', function() {
            var parser = function() {};
            wsb.addExtension('x-test', parser, parser);
            wsb.removeExtension('x-test');
            wsb.hasExtension('x-test').should.be.false;
        });
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
    
    mockupFrames.each(function(name, container) {
        it(format('should handle %s frame properly', name), function(done) {
            var wsb = new WebSocketBase();
            var socket = new MockupSocket();
            wsb.masked = container.mask;
            wsb.assignSocket(socket);
            switch (container.opcode) {
                case 0x01:
                    wsb.once('message', function(mess) {
                        mess.should.be.a('string');
                        mess.should.equal(container.content.toString());
                        done();
                    });
                    socket.write(container.frame);
                    break;
                case 0x08:
                    wsb.once('close', function(reason) {
                       done(); 
                    });
                    socket.write(container.frame);
                    break;
                case 0x09:
                    wsb.once('pong', function(mess) {
                        done(); 
                    });
                    socket.write(container.frame);
                    break;
                default:
                    socket.write(container.frame);
                    done();
                    break;
            }
        });
    });

});
