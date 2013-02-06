var assert = require('assert');

var frames = require('../mockup/frames');
var parser = require('../../lib/helper/parser');

function eachFrame(callback) {
    frames.allFrames.forEach(callback);
}

describe('#createMask()', function() {
    var mask = parser.createMask();
    
    it('should return a buffer', function() {
        assert.equal(true, Buffer.isBuffer(mask));
    }); 
    
    it('should return a buffer with length four', function() {
        assert.equal(4, mask.length);
    });
});

describe('#createHead()', function() {
    var createHead = parser.createHead;
    
    var headOne = createHead(true, true, 0x1, 40);
    var headTwo = createHead(true, false, 0x2, 120);
    var headThree = createHead(false, true, 0x3, 123);
    var headFour = createHead(false, false, 0x4, 124);
    
    it('should return a buffer', function() {
        assert.equal(true, Buffer.isBuffer(headOne));
        assert.equal(true, Buffer.isBuffer(headTwo));
        assert.equal(true, Buffer.isBuffer(headThree));
        assert.equal(true, Buffer.isBuffer(headFour));
    });
    
    it('should have set fin bit in head one and two', function() {
        assert.equal(true, Boolean(headOne[0] & 0x80));
        assert.equal(true, Boolean(headTwo[0] & 0x80));
    });
    
    it('should have not set fin bit in head three and four', function() {
        assert.equal(false, Boolean(headThree[0] & 0x80));
        assert.equal(false, Boolean(headFour[0] & 0x80));
    });
    
    it('should have set the correct opcode from head one to four', function() {
        assert.equal(0x1, headOne[0] & 0xF);
        assert.equal(0x2, headTwo[0] & 0xF);
        assert.equal(0x3, headThree[0] & 0xF);
        assert.equal(0x4, headFour[0] & 0xF);
    });
    
    it('should have set the correct length from head one to four', function() {
        assert.equal(40, headOne[1] & 0x7F);
        assert.equal(120, headTwo[1] & 0x7F);
        assert.equal(123, headThree[1] & 0x7F);
        assert.equal(124, headFour[1] & 0x7F);
    });
});

describe('#isFinal()', function() {
    var isFinal = parser.isFinal;
    
    eachFrame(function(frame) {
        it('should return ' + frame.fin + ' on ' + frame.name, function() {
            assert.equal(frame.fin, isFinal(frame.frame)); 
        });
    });
});

describe('#isMasked()', function() {
    var isMasked = parser.isMasked;
    
    eachFrame(function(frame) {
        it('should return '+ frame.mask + ' on ' + frame.name, function() {
            assert.equal(frame.mask, isMasked(frame.frame));
        });
    });
});

describe('#getOpcode()', function() {
    var getOpcode = parser.getOpcode;
    
    eachFrame(function(frame) {
        it('should return ' + frame.opcode + ' on ' + frame.name, function() {
            assert.strictEqual(frame.opcode, getOpcode(frame.frame)); 
        });
    })
});

describe('#getLength()', function() {
    var getLength = parser.getLength;
    
    eachFrame(function(frame) {
        it('should return ' + frame.length + ' on ' + frame.name, function() {
            assert.strictEqual(frame.length, getLength(frame.frame));
        });
    })
});

describe('#getMasking()', function() {
    var getMasking = parser.getMasking;
    
    eachFrame(function(frame) {
        if (frame.mask) {
            it('should return a buffer on ' + frame.name, function() {
                assert.strictEqual(true, Buffer.isBuffer(getMasking(frame.frame)));
            });
            it('should return a buffer with length of four on ' + frame.name, function() {
                assert.strictEqual(0x04, getMasking(frame.frame).length); 
            });
            it('should return a correct buffer on ' + frame.name, function() {
                assert.strictEqual(frame.masking.toString(), getMasking(frame.frame).toString()); 
            });
        } else {
            it('should return undefined on ' + frame.name, function() {
                assert.strictEqual(undefined, getMasking(frame.frame)); 
            });
        }
    });
});

describe('#getPayload()', function() {
    var getPayload = parser.getPayload;
    
    eachFrame(function(frame) {
        it('should return a buffer on '+ frame.name, function() {
            assert.strictEqual(true, Buffer.isBuffer(getPayload(frame.frame)));
        });
        it('should return a buffer with length of ' + frame.length + ' on '+ frame.name, function() {
            assert.strictEqual(frame.length, getPayload(frame.frame).length); 
        });
        it('should return a buffer matching the payload', function() {
            assert.strictEqual(frame.payload.toString(), getPayload(frame.frame).toString());
        });
    });
});

describe('#mask()', function() {
    var mask = parser.mask;
    
    eachFrame(function(frame) {
        it('should return a buffer on ' + frame.name, function() {
            assert.strictEqual(true, Buffer.isBuffer(mask(frame.masking, frame.payload))); 
        });
        it('should match the content of ' + frame.name, function() {
            assert.strictEqual(frame.content, mask(frame.masking, frame.payload).toString()); 
        });
    });
});


