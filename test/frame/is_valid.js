var util = require('util');
var should = require('should');

var mockupFrames = require('../mockup/frames');

var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var wsFrame;

    describe('#isValid()', function() {
        mockupFrames.each(function(name, mock) {
            wsFrame = new WebSocketFrame(mock.frame);
            
            it(util.format('should return null if no error on %s', name), function() {
                var err = wsFrame.isValid();
                should.not.exist(err);
            });

        });
    });
    
});

