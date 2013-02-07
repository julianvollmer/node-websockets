var assert = require('assert');

var frames = require('../mockup/frames');
var parser = require('../../lib/helper/parser');

function eachFrame(callback) {
    for (var name in frames) {
        var frame = frames[name];
        
        callback(name, frame.fin, frame.mask, frame.opcode, frame.length, frame.masking, frame.payload, frame.content, frame.frame);
    }
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
    
    eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
        
        it('should return ' + fin + ' on ' + name, function() {
            assert.equal(fin, isFinal(frame)); 
        });
        
    });
});

describe('#isMasked()', function() {
    var isMasked = parser.isMasked;
    
    eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
        
        it('should return '+ mask + ' on ' + name, function() {
            assert.equal(mask, isMasked(frame));
        });
        
    });
});

describe('#getOpcode()', function() {
    var getOpcode = parser.getOpcode;
    
    eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
        
        it('should return ' + opcode + ' on ' + name, function() {
            assert.strictEqual(opcode, getOpcode(frame)); 
        });
        
    });
});

describe('#getLength()', function() {
    var getLength = parser.getLength;
    
    eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
        
        it('should return ' + length + ' on ' + name, function() {
            assert.strictEqual(length, getLength(frame));
        });
        
    });
    
});

describe('#getMasking()', function() {
    var getMasking = parser.getMasking;
    
    eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
        
        if (mask) {
            it('should return a buffer on ' + name, function() {
                assert.strictEqual(true, Buffer.isBuffer(getMasking(frame)));
            });
            it('should return a buffer with length of four on ' + name, function() {
                assert.strictEqual(0x04, getMasking(frame).length); 
            });
            it('should return a correct buffer on ' + name, function() {
                assert.strictEqual(masking.toString(), getMasking(frame).toString()); 
            });
        } else {
            it('should return undefined on ' + name, function() {
                assert.strictEqual(undefined, getMasking(frame)); 
            });
        }
        
    });
});

describe('#getPayload()', function() {
    var getPayload = parser.getPayload;
    
    eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
        
        it('should return a buffer on '+ name, function() {
            assert.strictEqual(true, Buffer.isBuffer(getPayload(frame)));
        });
        it('should return a buffer with length of ' + length + ' on '+ name, function() {
            assert.strictEqual(length, getPayload(frame).length); 
        });
        it('should return a buffer matching the payload', function() {
            assert.strictEqual(payload.toString(), getPayload(frame).toString());
        });
        
    });
});

describe('#unmask()', function() {
    var unmask = parser.unmask;
    
    eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
        
        it('should return a buffer on ' + name, function() {
            assert.strictEqual(true, Buffer.isBuffer(unmask(masking, payload))); 
        });
        it('should match the content of ' + name, function() {
            assert.strictEqual(content, unmask(masking, payload).toString()); 
        });
    
    });
});