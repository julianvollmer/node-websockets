var util = require('util');

var MockupSocket = require('../mockup/socket');

var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {
    
    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocketSocket(msocket, { mask: true });
    });

    describe('#ping()', function() {
        it('should send a ping frame with empty body', function(done) {
            msocket.once('data', function(data) {
                var wsframe = new WebSocketFrame(data);
                if (wsframe.opcode == 0x09) {
                    wsframe.fin.should.be.true;
                    wsframe.mask.should.be.true;
                    wsframe.opcode.should.equal(0x09);
                    wsframe.length.should.equal(0x00);
                    done();
                }
            });
            wssocket.ping();
        });
    });

    describe('#ping([body])', function() {
        it('should send a ping frame containing "pongy"', function(done) {
            msocket.once('data', function(data) {
                var wsframe = new WebSocketFrame(data);
                if (wsframe.opcode == 0x09) {
                    wsframe.fin.should.be.true;
                    wsframe.mask.should.be.true;
                    wsframe.opcode.should.equal(0x09);
                    wsframe.length.should.equal(0x05);
                    wsframe.content.toString().should.equal('pongy');
                    done();
                }
            });
            wssocket.ping('pongy');
        });
    });

});
