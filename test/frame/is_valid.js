var util = require('util');
var should = require('should');

var mockupFrames = require('../mockup/frames');

var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var wsframe;

    describe('#isValid()', function() {

        beforeEach(function() {
            wsframe = new WebSocketFrame();
        });

        it('should return false if a rsv1 is set', function() {
            wsframe.rsv1 = true;
            wsframe.isValid().should.be.false;
        });

        it('should return false if a rsv2 is set', function() {
            wsframe.rsv2 = true;
            wsframe.isValid().should.be.false;
        });

        it('should return false if a rsv3 is set', function() {
            wsframe.rsv3 = true;
            wsframe.isValid().should.be.false;
        });

        it('should return true if allowed opcode is used', function() {
            wsframe.opcode = 0x01;
            wsframe.isValid().should.be.true;
            wsframe.opcode = 0x02;
            wsframe.isValid().should.be.true;
            wsframe.opcode = 0x08;
            wsframe.isValid().should.be.true;
            wsframe.opcode = 0x09;
            wsframe.isValid().should.be.true;
            wsframe.opcode = 0x0a;
            wsframe.isValid().should.be.true;
        });

        it('should return false if reserved opcode is used', function() {
            wsframe.opcode = 0x03;
            wsframe.isValid().should.be.false;
            wsframe.opcode = 0x04;
            wsframe.isValid().should.be.false;
            wsframe.opcode = 0x05;
            wsframe.isValid().should.be.false;
            wsframe.opcode = 0x06;
            wsframe.isValid().should.be.false;
            wsframe.opcode = 0x07;
            wsframe.isValid().should.be.false;
        });

        mockupFrames.each(function(name, mock) {

            before(function() {
                wsframe = new WebSocketFrame(mock.frame);
            });

            it(util.format('should return null if no error on %s', name), function() {
                wsframe.isValid().should.be.true;
            });

        });
    });
    
});

