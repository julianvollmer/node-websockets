var parser = require('../../build/Release/parser');

describe('native WebSocketParser', function() {

    var state, chunk;

    beforeEach(function() {
        state = { index: 0 };
        chunk = null;
    });

    describe('#readBodyBytes(state, chunk)', function() {

        it('should return undefined', function() {
            chunk = new Buffer('Hey');
            state.length = 2;
            parser.readBodyBytes(state, chunk);
        });

        xit('should return chunk', function() {
            chunk = new Buffer('Hello');
            parser.readBodyBytes(state, chunk).should.eql(chunk);
            state.index.should.equal(5);
        });

        xit('should return masked body', function() {
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

        it('should throw error if first argument not an object', function() {
            (function() {
                parser.readBodyBytes([], new Buffer(0));
            }).should.throwError('Argument one must be an object.');
        });

        it('should throw error if first argument not has index', function() {
            state = {};
            (function() {
                parser.readBodyBytes(state, new Buffer(0));
            }).should.throwError('Argument one must have property index.');
        });

        it('should throw error if first argument not has length', function() {
            (function() {
                parser.readBodyBytes(state, new Buffer(0));
            }).should.throwError('Argument one must have property length.');
        });

        it('should throw error if second argument not a buffer', function() {
            state.length = 2;
            (function() {
                parser.readBodyBytes(state, {});
            }).should.throwError('Argument two must be a buffer.');
        });

    });

});
