var should = require('should');

var MockupSocket = require('../mockup/socket');
var mockupExtensions = require('../mockup/extensions');

var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {
    
    var options, msocket, wssocket;

    describe('#send(data)', function() {
        before(function() {
            msocket = new MockupSocket();
            wssocket = new WebSocketSocket(msocket);
        });

        it('should send a text frame through the underlaying socket', function(done) {
            msocket.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c);
                frame.content.toString().should.equal('Hello World.');
                done();
            });
            wssocket.send('Hello World.');
        });
    });

    describe('#send(data) with extensions', function() {
        before(function() {
            options = { extensions: mockupExtensions };

            msocket = new MockupSocket();
            wssocket = new WebSocketSocket(msocket, options);
        });

        it('should send a extended text frame through the underlaying socket', function(done) {
            msocket.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c + 8);
                frame.content.toString().should.equal('Hello World.bubutaja');
                done();
            });
            wssocket.send('Hello World.');
        });
    });

});
