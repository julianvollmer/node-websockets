var should = require('should');

var MockupSocket = require('../mockup/socket');
var mockupExtensions = require('../mockup/extensions');

var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {
    
    var options, msocket, wssocket;

    before(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocketBase(msocket, options);
    });

    describe('#send(data)', function() {
        it('should send a text frame through the underlaying socket', function(done) {
            msocket.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c);
                frame.content.toString().should.equal('Hello World.');
            });
            wssocket.send('Hello World.');
        });
    });

    before(function() {
        options = { extensions: Object.keys(mockupExtensions) };

        msocket = new MockupSocket();
        wssocket = new WebSocketBase(mckpsock, options);
    });

    describe('#send(data) with extensions', function() {
        it('should send a extended text frame through the underlaying socket', function(done) {
            msocket.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c + 8);
                frame.content.toString().should.equal('Hello World.bubutaja');
            });
            wssocket.send('Hello World.');
        });
    });

});
