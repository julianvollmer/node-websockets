var parser = require('../../build/Release/parser');

describe('native WebSocketParser', function() {

    var state, chunk;

    beforeEach(function() {
        state = { index: 0 };
        chunk = null;
    });

    describe('#writeBodyBytes(state, chunk)', function() {
        
        it('should return chunk', function() {
            chunk = new Buffer('Hello');
            parser.writeBodyBytes(state, chunk).should.equal(chunk);
        });

        it('should return masked chunk', function() {
            state.mask = true;
            state.masking = new Buffer([0x23, 0x7b, 0xfa, 0xc2]);
            var body = new Buffer('Hello');
            var masked = new Buffer([0x6b, 0x1e, 0x96, 0xae, 0x4c]);
            parser.writeBodyBytes(state, body).should.eql(masked);
        });

    });

});
