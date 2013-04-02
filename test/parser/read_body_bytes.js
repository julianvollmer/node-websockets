var parser = require('../../lib/parser');

describe('WebSocketParser', function() {

    var state, chunk;

    beforeEach(function() {
        state = { index: 0 };
        chunk = null;
    });

    describe('#readBodyBytes(state, chunk)', function() {
        
        it('should return chunk', function() {
            chunk = new Buffer('Hello');
            parser.readBodyBytes(state, chunk).should.equal(chunk);
            state.index.should.equal(5);
        });

        it('should return masked body', function() {
            state.mask = true;
            state.masking = new Buffer([0x23, 0x7b, 0xfa, 0xc2]);
            var chunks = [];
            var chunkOne = new Buffer([0x6b, 0x1e]);
            var chunkTwo = new Buffer([0x96, 0xae, 0x4c]);
            chunks.push(parser.readBodyBytes(state, chunkOne));
            chunks.push(parser.readBodyBytes(state, chunkTwo));
            Buffer.concat(chunks).should.eql(new Buffer('Hello'));
            state.index.should.equal(5);
        });

    });

});
