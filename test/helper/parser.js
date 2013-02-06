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
    
    var heads = [
        { fin: true, mask: true, opcode: 0x1, length: 40, buffer: createHead(true, true, 0x1, 40) },
        { fin: true, mask: false, opcode: 0x2, length: 125, buffer: createHead(true, false, 0x2, 125) },
        { fin: false, mask: true, opcode: 0x3, length: 65535, buffer: createHead(false, true, 0x3, 65535) },
        { fin: false, mask: false, opcode: 0x4, length: 70000, buffer: createHead(false, false, 0x4, 70000) }
    ];
    
    heads.forEach(function(head, i) {
        it('should return a buffer object on ' + i, function() {
            assert.strictEqual(true, Buffer.isBuffer(head.buffer)); 
        });
        it('should have set fin bit to ' + head.fin + ' on '+ i, function() {
            assert.strictEqual(head.fin, Boolean(head.buffer[0] & 0x80)); 
        });
        it('should have set mask bit to ' + head.mask + ' on ' + i, function() {
            assert.strictEqual(head.mask, Boolean(head.buffer[1] & 0x80)); 
        });
        it('should have set opcode of ' + head.opcode + ' on ' + i, function() {
            assert.strictEqual(head.opcode, head.buffer[0] & 0xf); 
        });
        it('should have set length of ' + head.length + ' on ' + i, function() {
            var headLen = head.buffer[1] & 0x7f;
            
            if (headLen < 126) {
                assert.strictEqual(head.length, head.buffer[1] & 0x7f);    
            }
            if (headLen == 126) {
                assert.strictEqual(head.length, head.buffer.slice(2, 4).readUInt16BE(0));
            }
            if (headLen == 127) {
                var lenBuf = head.buffer.slice(2, 10);
                assert.strictEqual(head.length, (lenBuf.readUInt32BE(0) << 8) + lenBuf.readUInt32BE(4));
            }
        });
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


