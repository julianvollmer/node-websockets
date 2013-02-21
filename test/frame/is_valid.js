var util = require('util');
var should = require('should');

var WebSocketFrame = require('../../lib/frame');
var mockupFrames = require('../mockup/frames');

var format = util.format;

describe('WebSocketFrame', function() {

    var wsFrame;

    describe('#isValid()', function() {
        mockupFrames.each(function(name, mock) {
            wsFrame = new WebSocketFrame(mock.frame);
            
            it(format('should return true on %s', name), function() {
                wsFrame.isValid().should.be.true;
            });

        });
    });
    
});

