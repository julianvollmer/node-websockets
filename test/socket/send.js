var MockupSocket = require('../mockup/socket');
var mockupExtensions = require('../mockup/extensions');

var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {
    
    var msocket, wssocket;

    describe('#send(message)', function() {
        
        before(function() {
            msocket = new MockupSocket();
            wssocket = new WebSocketSocket(msocket);
        });

        it('should send a text frame if argument is a string', function(done) {
            msocket.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.mask.should.be.false;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c);
                frame.content.toString().should.equal('Hello World.');
                done();
            });
            wssocket.send('Hello World.');
        });

        it('should send a binary frame if argument is a buffer', function(done) {
            msocket.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.mask.should.be.false;
                frame.opcode.should.equal(0x02);
                frame.length.should.equal(0x03);
                frame.content.toString().should.equal('\u0001\u0002\u0003');
                done();
            });
            wssocket.send(new Buffer([0x01, 0x02, 0x03]));
        });
    });

    describe('#send(message) with extensions', function() {

        before(function() {
            msocket = new MockupSocket();
            wssocket = new WebSocketSocket(msocket, { extensions: mockupExtensions });
        });

        it('should send a text frame extended with "bubutaja"', function(done) {
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
