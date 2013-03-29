var util = require('util');
var should = require('should');

var mockupFrames = require('../mockup/frames');

var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var wsFrame;

    describe('#isValid()', function() {

        beforeEach(function() {
            wsFrame = new WebSocketFrame();
        });

        it('should return false if a rsv1 is set', function() {
            wsFrame.rsv1 = true;
            wsFrame.isValid().should.be.false;
        });

        it('should return false if a rsv2 is set', function() {
            wsFrame.rsv2 = true;
            wsFrame.isValid().should.be.false;
        });

        it('should return false if a rsv3 is set', function() {
            wsFrame.rsv3 = true;
            wsFrame.isValid().should.be.false;
        });

        it('should return false if reserved opcode is used', function() {
            wsFrame.opcode = 0x03;
            wsFrame.isValid().should.be.false;
            wsFrame.opcode = 0x04;
            wsFrame.isValid().should.be.false;
            wsFrame.opcode = 0x05;
            wsFrame.isValid().should.be.false;
            wsFrame.opcode = 0x06;
            wsFrame.isValid().should.be.false;
            wsFrame.opcode = 0x07;
            wsFrame.isValid().should.be.false;
        });

        mockupFrames.each(function(name, mock) {

            before(function() {
                wsFrame = new WebSocketFrame(mock.frame);
            });

            it(util.format('should return null if no error on %s', name), function() {
                wsFrame.isValid().should.be.true;
            });

        });
    });
    
});

