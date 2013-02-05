var assert = require('assert');

var frames = require('../mockup/frames');
var parser = require('../../lib/helper/parser');

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
    
    it('should return true on all control frames', function() {
        assert.equal(true, isFinal(frames.maskedCloseFrame));
        assert.equal(true, isFinal(frames.unmaskedCloseFrame));
        assert.equal(true, isFinal(frames.maskedPingFrame));
        assert.equal(true, isFinal(frames.unmaskedPingFrame));
        assert.equal(true, isFinal(frames.maskedPongFrame));
        assert.equal(true, isFinal(frames.unmaskedPongFrame));
    });
    
    it('should return true on single frames', function() {
        assert.equal(true, isFinal(frames.singleMaskedTextFrame)); 
        assert.equal(true, isFinal(frames.singleUnmaskedTextFrame));
    });
    
    it('should return true on all last fragmented text frames', function() {
        assert.equal(true, isFinal(frames.secondFragmentedUnmaskedTextFrame));
    });
    
    it('should return false on all first fragmented text frames', function() {
        assert.equal(false, isFinal(frames.firstFragmentedUnmaskedTextFrame));
    });
});

describe('#isMasked()', function() {
    var isMasked = parser.isMasked;
    
    it('should return true for masked text, close, ping and pong frame', function() {
        assert.equal(true, isMasked(frames.singleMaskedTextFrame));
        assert.equal(true, isMasked(frames.maskedCloseFrame));
        assert.equal(true, isMasked(frames.maskedPingFrame));
        assert.equal(true, isMasked(frames.maskedPongFrame));
    });
    
    it('should return false for unmasked text, close, ping and pong frame', function() {
        assert.equal(false, isMasked(frames.singleUnmaskedTextFrame));
        assert.equal(false, isMasked(frames.firstFragmentedUnmaskedTextFrame));
        assert.equal(false, isMasked(frames.secondFragmentedUnmaskedTextFrame));
        assert.equal(false, isMasked(frames.unmaskedCloseFrame));
        assert.equal(false, isMasked(frames.unmaskedPingFrame));
        assert.equal(false, isMasked(frames.unmaskedPongFrame));
    });
});

describe('#getOpcode()', function() {
    var getOpcode = parser.getOpcode;
    
    it('should return 0x0 for continuation frames', function() {
        assert.strictEqual(0x0, getOpcode(frames.secondFragmentedUnmaskedTextFrame));
    });
    
    it('should return 0x1 for text frames', function() {
         assert.strictEqual(0x1, getOpcode(frames.singleMaskedTextFrame));
         assert.strictEqual(0x1, getOpcode(frames.singleUnmaskedTextFrame));
         assert.strictEqual(0x1, getOpcode(frames.firstFragmentedUnmaskedTextFrame));
    });
    
    it('should return 0x8 for close frames', function() {
        assert.strictEqual(0x8, getOpcode(frames.maskedCloseFrame));
        assert.strictEqual(0x8, getOpcode(frames.unmaskedCloseFrame));
    });
    
    it('should return 0x9 for ping frames', function() {
        assert.strictEqual(0x9, getOpcode(frames.maskedPingFrame));
        assert.strictEqual(0x9, getOpcode(frames.unmaskedPingFrame)); 
    });
    
    it('should return 0xA for pong frames', function() {
        assert.strictEqual(0xA, getOpcode(frames.maskedPongFrame));
        assert.strictEqual(0xA, getOpcode(frames.unmaskedPongFrame));
    });
});

describe('#getLength()', function() {
    var getLength = parser.getLength;
    
    it('should return length 5 for all frames', function() {
        assert.strictEqual(5, getLength(frames.singleMaskedTextFrame));
        assert.strictEqual(5, getLength(frames.singleUnmaskedTextFrame));
        assert.strictEqual(5, getLength(frames.maskedCloseFrame));
        assert.strictEqual(5, getLength(frames.unmaskedCloseFrame));
        assert.strictEqual(5, getLength(frames.maskedPingFrame));
        assert.strictEqual(5, getLength(frames.unmaskedPingFrame));
        assert.strictEqual(5, getLength(frames.maskedPongFrame));
        assert.strictEqual(5, getLength(frames.unmaskedPongFrame));
    });
});

describe('#getMasking()', function() {
    var getMasking = parser.getMasking;
    
    it('should return a buffer if frame has a masking key', function() {
        assert.equal(true, Buffer.isBuffer(getMasking(frames.singleMaskedTextFrame)));
        assert.equal(true, Buffer.isBuffer(getMasking(frames.maskedCloseFrame)));
        assert.equal(true, Buffer.isBuffer(getMasking(frames.maskedPingFrame)));
        assert.equal(true, Buffer.isBuffer(getMasking(frames.maskedPongFrame)));
    });
    
    it('should return undefined if frame has no masking key', function() {
        assert.strictEqual(undefined, getMasking(frames.singleUnmaskedTextFrame));
        assert.strictEqual(undefined, getMasking(frames.unmaskedCloseFrame));
        assert.strictEqual(undefined, getMasking(frames.unmaskedPingFrame));
        assert.strictEqual(undefined, getMasking(frames.unmaskedPongFrame));
    });
    
    it('should return a buffer with length of four bytes', function() {
        assert.strictEqual(4, getMasking(frames.singleMaskedTextFrame).length);
        assert.strictEqual(4, getMasking(frames.maskedCloseFrame).length);
        assert.strictEqual(4, getMasking(frames.maskedPingFrame).length);
        assert.strictEqual(4, getMasking(frames.maskedPongFrame).length);
    });
    
    var masking = new Buffer([0x37, 0xfa, 0x21, 0x3d]).toString();
    it('should return a buffer with the correct bytes', function() {
        assert.strictEqual(masking, getMasking(frames.singleMaskedTextFrame).toString());
        assert.strictEqual(masking, getMasking(frames.maskedCloseFrame).toString());
        assert.strictEqual(masking, getMasking(frames.maskedPingFrame).toString());
        assert.strictEqual(masking, getMasking(frames.maskedPongFrame).toString());
    });
});

describe('#getPayload()', function() {
    var getPayload = parser.getPayload;
    
    it('should return a buffer', function() {
        assert.equal(true, Buffer.isBuffer(getPayload(frames.singleMaskedTextFrame)));
        assert.equal(true, Buffer.isBuffer(getPayload(frames.singleUnmaskedTextFrame)));
        assert.equal(true, Buffer.isBuffer(getPayload(frames.maskedCloseFrame)));
    });
    
    it('should return a buffer which contains the string "Hello" in umasked frames', function() {
        assert.strictEqual('Hello', getPayload(frames.singleUnmaskedTextFrame).toString());
        assert.strictEqual('Hello', getPayload(frames.unmaskedCloseFrame).toString());
        assert.strictEqual('Hello', getPayload(frames.unmaskedPingFrame).toString());
        assert.strictEqual('Hello', getPayload(frames.unmaskedPongFrame).toString());
    });
});

describe('#mask()', function() {
    var mask = parser.mask;
    var buff = new Buffer([0x4d, 0x77, 0x32, 0x10]);
    var masking = new Buffer([0x37, 0xfa, 0x21, 0x3d]);
    var payload = new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]);
    
    it('should return a buffer', function() {
        assert.equal(true, Buffer.isBuffer(mask(buff, buff)));
    });
    
    it('should unmask a masked buffer to "Hello"', function() {
        assert.strictEqual('Hello', mask(masking, payload).toString()); 
    });
});