var crypto = require('crypto');

var parser = require('../../lib/helper/parser');

function testMask() {
    var masking = crypto.randomBytes(4);
    var payload = new Buffer('hello world');
    
    var maskedPayload = parser.mask(masking, payload);
    var unmaskedPayload = parser.unmask(masking, maskedPayload);
    
    return payload.toString() === unmaskedPayload.toString();
}

function testCreateHead() {
    var firstHead = parser.createHead(true, true, 0x0, 10);
    var secondHead = parser.createHead(false, false, 0x1, 12);
    
    if (!parser.isFinal(firstHead)) {
         return false;   
    }
    if (!parser.isMasked(firstHead)) {
        return false;
    }
    if (parser.getOpcode(firstHead) !== 0x0) {
        return false;
    }
    if (parser.getLength(firstHead) !== 10) {
        return false;
    }
    if (parser.isFinal(secondHead)) {
        return false;
    }
    if (parser.isMasked(secondHead)) {
        return false;
    }
    if (parser.getOpcode(secondHead) !== 0x1) {
        return false;
    }
    if (parser.getLength(secondHead) !== 12) {
        return false;
    }
    
    return true;
}

console.log('mask test: ', testMask());
console.log('createHead test: ', testCreateHead());