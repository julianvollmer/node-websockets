var should = require('should');

var MockupSocket = require('../mockup/socket');
var mockupExtensions = require('../mockup/extensions');

var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {
    
    var options, msocket, wssocket;

    before(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocketSocket(msocket, options);
    });

    describe('#close(data)', function() {
        it('should send a close frame through the underlaying socket', function(done) {
            msocket.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                frame.opcode.should.equal(0x08);
                frame.length.should.equal(0x0c);
                frame.content.toString().should.equal('Hello World.');
                done();
            });
            wssocket.close('Hello World.');
        });
    });

});
