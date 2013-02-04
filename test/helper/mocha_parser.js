var assert = require('assert');

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
    var headOne = parser.createHead(true, true, 0x1, 40);
    var headTwo = parser.createHead(true, false, 0x2, 120);
    
    it('should return a buffer', function() {
        assert.equal(true, Buffer.isBuffer(headOne));
        assert.equal(true, Buffer.isBuffer(headTwo));
    });
    
    it('should have set fin bit in head one and two', function() {
        assert.equal(true, Boolean(headOne[0] | 0x80));
        assert.equal(true, Boolean(headTwo[0] | 0x80));
    });
});