var MockupSocket = require('./msocket');
var WebSocket = require('../../lib/stream');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    it('should use common settings as default', function(done) {
        msocket.once('data', function(chunk) {
            var fin = chunk[0] & 0x80;
            var mask = chunk[1] & 0x80;
            var rsv1 = chunk[0] & 0x40;
            var rsv2 = chunk[0] & 0x20;
            var rsv3 = chunk[0] & 0x10;
            var opcode = chunk[0] & 0x0f;
            var length = chunk[1] & 0x7f;

            fin.should.equal(0x00);
            mask.should.equal(0x00);
            rsv1.should.equal(0x00);
            rsv2.should.equal(0x00);
            rsv3.should.equal(0x00);
            opcode.should.equal(0x01);
            length.should.equal(0x00);
            chunk.length.should.equal(2);
            
            done();
        });
        wssocket.write(new Buffer(0));
    });

    describe('wssocket.writeHead({ fin: bool })', function() {
        
        it('should set flag', function() {
            wssocket.writeHead({ fin: true });
            wssocket._frameWriteState.fin.should.be.true;
            wssocket.writeHead({ fin: false });
            wssocket._frameWriteState.fin.should.be.false;
        });

        it('should not change if undefined', function() {
            wssocket.writeHead({ fin: true });
            wssocket._frameWriteState.fin.should.be.true;
            wssocket.writeHead({ fin: undefined });
            wssocket._frameWriteState.fin.should.be.true;
            wssocket.writeHead({ fin: false });
            wssocket._frameWriteState.fin.should.be.false;
            wssocket.writeHead({ fin: undefined });
            wssocket._frameWriteState.fin.should.be.false;
        });

        it('should convert value to Boolean', function() {
            wssocket.writeHead({ fin: 1 });
            wssocket._frameWriteState.fin.should.be.true;
            wssocket.writeHead({ fin: 0 });
            wssocket._frameWriteState.fin.should.be.false;
            wssocket.writeHead({ fin: 'a' });
            wssocket._frameWriteState.fin.should.be.true;
            wssocket.writeHead({ fin: '' });
            wssocket._frameWriteState.fin.should.be.false;
        });

        it('should set fin bit', function(done) {
            msocket.once('data', function(chunk) {
                var fin = chunk[0] & 0x80;
                
                fin.should.equal(0x80);
                chunk.length.should.equal(2);
                
                done();
            });
            wssocket.writeHead({ fin: true });
            wssocket.write(new Buffer(0));
        });

        it('should not set fin bit', function(done) {
            msocket.once('data', function(chunk) {
                var fin = chunk[0] & 0x80;
                
                fin.should.equal(0);
                chunk.length.should.equal(2);
                
                done();
            });
            wssocket.writeHead({ fin: false });
            wssocket.write(new Buffer(0));
        });

    });

    describe('wssocket.writeHead({ mask: bool })', function() {
        
        it('should set flag', function() {
            wssocket.writeHead({ mask: true });
            wssocket._frameWriteState.mask.should.be.true;
            wssocket.writeHead({ mask: false });
            wssocket._frameWriteState.mask.should.be.false;
        });

        it('should not change if undefined', function() {
            wssocket.writeHead({ mask: true });
            wssocket._frameWriteState.mask.should.be.true;
            wssocket.writeHead({ mask: undefined });
            wssocket._frameWriteState.mask.should.be.true;
            wssocket.writeHead({ mask: false });
            wssocket._frameWriteState.mask.should.be.false;
            wssocket.writeHead({ mask: undefined });
            wssocket._frameWriteState.mask.should.be.false;
        });

        it('should convert value to Boolean', function() {
            wssocket.writeHead({ mask: 1 });
            wssocket._frameWriteState.mask.should.be.true;
            wssocket.writeHead({ mask: 0 });
            wssocket._frameWriteState.mask.should.be.false;
            wssocket.writeHead({ mask: 'a' });
            wssocket._frameWriteState.mask.should.be.true;
            wssocket.writeHead({ mask: '' });
            wssocket._frameWriteState.mask.should.be.false;
        });

        it('should set mask bit', function(done) {
            msocket.once('data', function(chunk) {
                var mask = chunk[1] & 0x80;
                
                mask.should.equal(0x80);
                chunk.length.should.equal(6);
                
                done();
            });
            wssocket.writeHead({ mask: true });
            wssocket.write(new Buffer(0));
        });

        it('should not set mask bit', function(done) {
            msocket.once('data', function(chunk) {
                var mask = chunk[1] & 0x80;

                mask.should.equal(0);
                chunk.length.should.equal(2);
                
                done();
            });
            wssocket.writeHead({ mask: false });
            wssocket.write(new Buffer(0));
        });

    });

    describe('wssocket.writeHead({ opcode: number })', function() {
        
        it('should set value', function() {
            wssocket.writeHead({ opcode: 0x00 });
            wssocket._frameWriteState.opcode.should.equal(0x00);
            wssocket.writeHead({ opcode: 0x02 });
            wssocket._frameWriteState.opcode.should.equal(0x02);
            wssocket.writeHead({ opcode: 0x08 });
            wssocket._frameWriteState.opcode.should.equal(0x08);
            wssocket.writeHead({ opcode: 0x0a });
            wssocket._frameWriteState.opcode.should.equal(0x0a);
        });

        it('should not change if in reserved range', function() {
            wssocket.writeHead({ opcode: 0x03 });
            wssocket._frameWriteState.opcode.should.equal(0x01);
            wssocket.writeHead({ opcode: 0x05 });
            wssocket._frameWriteState.opcode.should.equal(0x01);
            wssocket.writeHead({ opcode: 0x07 });
            wssocket._frameWriteState.opcode.should.equal(0x01);
            wssocket.writeHead({ opcode: 0x0b });
            wssocket._frameWriteState.opcode.should.equal(0x01);
        });

        it('should set opcode to 0x00', function(done) {
            msocket.once('data', function(chunk) {
                var opcode = chunk[0] & 0x0f;
                
                opcode.should.equal(0x00);
                chunk.length.should.equal(2);
                
                done();
            });
            wssocket.writeHead({ opcode: 0x00 });
            wssocket.write(new Buffer(0));
        });

        it('should set opcode 0x0a', function(done) {
            msocket.once('data', function(chunk) {
                var opcode = chunk[0] & 0x0f;
                
                opcode.should.equal(0x0a);
                chunk.length.should.equal(2);
                
                done();
            });
            wssocket.writeHead({ opcode: 0x0a });
            wssocket.write(new Buffer(0));
        });

    });

    describe('wssocket.writeHead({ length: number })', function() {
        
        it('should set value', function() {
            wssocket.writeHead({ length: 0x33 });
            wssocket._frameWriteState.length.should.equal(0x33);
        });

        it('should use the chunk length if length null', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;
                
                length.should.equal(4);
                chunk.length.should.equal(6);
                
                done();
            });
            wssocket.writeHead({ length: 0 });
            wssocket.write(new Buffer(4));
            
        });
    
        it('should set length to 0', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;
                
                length.should.equal(0);
                chunk.length.should.equal(2);
                
                done();
            });
            wssocket.writeHead({ length: 0 });
            wssocket.write(new Buffer(0));
        });
    
        it('should set length to 125', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;
                
                length.should.equal(125);
                chunk.length.should.equal(2);
                
                done();
            });
            wssocket.writeHead({ length: 125 });
            wssocket.write(new Buffer(0));
        });

        it('should set length to 126', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt16BE(2);

                hlength.should.equal(126);
                plength.should.equal(126);
                chunk.length.should.equal(4);
                
                done();
            });
            wssocket.writeHead({ length: 126 });
            wssocket.write(new Buffer(0));
        });
    
        it('should set length to 127', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt16BE(2);

                hlength.should.equal(126);
                plength.should.equal(127);
                chunk.length.should.equal(4);
                
                done();
            });
            wssocket.writeHead({ length: 127 });
            wssocket.write(new Buffer(0));
        });
        
        it('should set length to 65535', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt16BE(2);

                hlength.should.equal(126);
                plength.should.equal(65535);
                chunk.length.should.equal(4);
                
                done();
            });
            wssocket.writeHead({ length: 65535 });
            wssocket.write(new Buffer(0));
        });
    
        it('should set length to 65536', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt32BE(6);

                hlength.should.equal(127);
                plength.should.equal(65536);
                chunk.length.should.equal(10);
                
                done();
            });
            wssocket.writeHead({ length: 65536 });
            wssocket.write(new Buffer(0));
        });

        // exceeds v8 object limit (the buffer)
        // TODO: throw error check
        it('should set length to 4294967295', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt32BE(6);

                hlength.should.equal(127);
                plength.should.equal(4294967295);
                chunk.length.should.equal(10);
                
                done();
            });
            wssocket.writeHead({ length: 4294967295 });
            wssocket.write(new Buffer(0));
        });

    });

    describe('wssocket.writeHead({ masking: new Buffer([0x73, 0x2a, 0xc0, 0x0f]) })', function() {

        it('should enable mask flag', function() {
            wssocket.writeHead({ masking: new Buffer([0x73, 0x2a, 0xc0, 0x0f]) });
            wssocket._frameWriteState.mask.should.be.true;
            wssocket._frameWriteState.masking.toString('base64').should.equal('cyrADw==');
        });

        it('should use masking bytes from head', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;
                var masking = chunk.slice(2);

                chunk.length.should.equal(6);
                masking.toString('base64').should.equal('cyrADw==');

                done();
            });
            wssocket.writeHead({ masking: new Buffer([0x73, 0x2a, 0xc0, 0x0f]) });
            wssocket.write(new Buffer(0));
        });

    });

    describe('writing head bytes with masking', function() {
        
        it('should have masking bytes, length == 125', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;

                length.should.equal(125);
                chunk.length.should.equal(6);
                
                done();
            });
            wssocket.writeHead({ mask: true, length: 125 });
            wssocket.write(new Buffer(0));
        });

        it('should have masking bytes, length == 65535', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt16BE(2);

                hlength.should.equal(126);
                plength.should.equal(65535);
                chunk.length.should.equal(8);
                
                done();
            });
            wssocket.writeHead({ mask: true, length: 65535 });
            wssocket.write(new Buffer(0));
        });

        it('should have masking bytes, length == 65536', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt32BE(6);

                hlength.should.equal(127);
                plength.should.equal(65536);
                chunk.length.should.equal(14);
                
                done();
            });
            wssocket.writeHead({ mask: true, length: 65536 });
            wssocket.write(new Buffer(0));
        });

    });

});
