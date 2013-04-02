var parser = require('../../lib/parser');

describe('WebSocketParser', function() {

    var state, chunk;

    beforeEach(function() {
        state = {};
        chunk = null;
    });

    describe('#writeHeadBytes(state, [chunk])', function() {
 
        it('should set fin flag', function() {
            state.fin = true;
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('gAA=');
        });

        it('should not set fin flag', function() {
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AAA=');
        });
 
        it('should set mask flag', function() {
            state.mask = true;
            chunk = parser.writeHeadBytes(state);
            chunk.length.should.equal(6);
            chunk.slice(0, 2).toString('base64').should.equal('AIA=');
        });

        it('should not set mask flag', function() {
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AAA=');
        });

        it('should set opcode to 0x00', function() {
            state.opcode = 0x01;
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AQA=');
        });

        it('should set opcode to 0x0a', function() {
            state.opcode = 0x0a;
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('CgA=');
        });

        it('should use chunk.length if defined', function() {
            chunk = parser.writeHeadBytes(state, new Buffer(8));
            chunk.toString('base64').should.equal('AAg=');
        });

        it('should set length to 125', function() {
            state.length = 125;
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AH0=');
        });

        it('should set length to 126', function() {
            state.length = 126;
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AH4Afg==');
        });

        it('should set length to 127', function() {
            state.length = 127;
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AH4Afw==');
        });

        it('should set length to 65535', function() {
            state.length = 65535;
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AH7//w==');
        });

        it('should set length to 65536', function() {
            state.length = 65536;
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AH8AAAAAAAEAAA==');
        });

        it('should set length to 4294967295', function() {
            state.length = 4294967295;
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AH8AAAAA/////w==');
        });
        it('should set mask flag and length to 125', function() {
            state.mask = true;
            state.length = 125;
            chunk = parser.writeHeadBytes(state);
            chunk.length.should.equal(6);
            chunk.slice(0, 2).toString('base64').should.equal('AP0=');
        });

        it('should set mask flag and set length to 126', function() {
            state.mask = true;
            state.length = 126;
            chunk = parser.writeHeadBytes(state);
            chunk.length.should.equal(8);
            chunk.slice(0, 4).toString('base64').should.equal('AP4Afg==');
        });

        it('should set mask flag and set length to 127', function() {
            state.mask = true;
            state.length = 127;
            chunk = parser.writeHeadBytes(state);
            chunk.length.should.equal(8);
            chunk.slice(0, 4).toString('base64').should.equal('AP4Afw==');
        });

        it('should set mask flag and set length to 65535', function() {
            state.mask = true;
            state.length = 65535;
            chunk = parser.writeHeadBytes(state);
            chunk.length.should.equal(8);
            chunk.slice(0, 4).toString('base64').should.equal('AP7//w==');
        });

        it('should set mask flag and set length to 65536', function() {
            state.mask = true;
            state.length = 65536;
            chunk = parser.writeHeadBytes(state);
            chunk.length.should.equal(14);
            chunk.slice(0, 10).toString('base64').should.equal('AP8AAAAAAAEAAA==');
        });

        it('should set mask flag and set length to 4294967295', function() {
            state.mask = true;
            state.length = 4294967295;
            chunk = parser.writeHeadBytes(state);
            chunk.length.should.equal(14);
            chunk.slice(0, 10).toString('base64').should.equal('AP8AAAAA/////w==');
        });

        it('should set masking to 0x43, 0xbe, 0x07, 0xf1', function() {
            state.masking = new Buffer([0x43, 0xbe, 0x07, 0xf1]);
            chunk = parser.writeHeadBytes(state);
            chunk.toString('base64').should.equal('AABDvgfx');
        });

    });

});
