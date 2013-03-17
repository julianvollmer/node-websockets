var util = require('util');
var should = require('should');

var MockupSocket = require('../mockup/socket');

var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {
    
    var msocket, wssocket;

    before(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocketSocket(msocket);
    });

    describe('#ping()', function() {
        it('should send a ping frame containing "pongy" through the underlaying socket', function(done) {
            msocket.once('data', function(data) {
                var frame = new WebSocketFrame(data);
                if (frame.opcode == 0x09) {
                    frame.fin.should.be.true;
                    frame.opcode.should.equal(0x09);
                    frame.length.should.equal(0x05);
                    frame.content.toString().should.equal('pongy');
                    done();
                }
            });
            wssocket.ping('pongy');
        });
    });

});
