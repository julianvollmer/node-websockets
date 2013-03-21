var MockupSocket = require('../mockup/socket');
var mockupExtensions = require('../mockup/extensions');

var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {
    
    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocketSocket(msocket, { mask: true });
    });

    describe('#close([reason])', function() {
        it('should send a close frame with empty body', function(done) {
            msocket.once('data', function(chunk) {
                var wsframe = new WebSocketFrame(chunk);
                wsframe.fin.should.be.true;
                wsframe.mask.should.be.true;
                wsframe.opcode.should.equal(0x08);
                wsframe.length.should.equal(0x00);
                done();
            });
            wssocket.close();
        });
        it('should send a close frame with "Hello World."', function(done) {
            msocket.once('data', function(chunk) {
                var wsframe = new WebSocketFrame(chunk);
                wsframe.fin.should.be.true;
                wsframe.mask.should.be.true;
                wsframe.opcode.should.equal(0x08);
                wsframe.length.should.equal(0x0c);
                wsframe.content.toString().should.equal('Hello World.');
                done();
            });
            wssocket.close('Hello World.');
        });
    });

});
