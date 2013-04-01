var MockupSocket = require('./msocket');
var WebSocketStream = require('../../lib/stream');

describe('WebSocketStream', function() {

    var msocket, wsstream;

    beforeEach(function() {
        msocket = new MockupSocket();
        wsstream = new WebSocketStream(msocket);
    });

    describe('writing head bytes', function() {

        it('should use common settings as default', function(done) {
            msocket.once('data', function(chunk) {
                var fin = chunk[0] & 0x80;
                var mask = chunk[1] & 0x80;
                var rsv1 = chunk[0] & 0x40;
                var rsv2 = chunk[0] & 0x20;
                var rsv3 = chunk[0] & 0x10;
                var opcode = chunk[0] & 0x0f;
                var length = chunk[1] & 0x7f;

                fin.should.equal(0x80);
                mask.should.equal(0x00);
                rsv1.should.equal(0x00);
                rsv2.should.equal(0x00);
                rsv3.should.equal(0x00);
                opcode.should.equal(0x01);
                length.should.equal(0x00);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.write(new Buffer(0));
        });

        it('should set fin bit', function(done) {
            msocket.once('data', function(chunk) {
                var fin = chunk[0] & 0x80;
                
                fin.should.equal(0x80);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeHead({ fin: true });
            wsstream.write(new Buffer(0));
        });

        it('should not set fin bit', function(done) {
            msocket.once('data', function(chunk) {
                var fin = chunk[0] & 0x80;
                
                fin.should.equal(0);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeHead({ fin: false });
            wsstream.write(new Buffer(0));
        });

        it('should set mask bit', function(done) {
            msocket.once('data', function(chunk) {
                var mask = chunk[1] & 0x80;
                
                mask.should.equal(0x80);
                chunk.length.should.equal(6);
                
                done();
            });
            wsstream.writeHead({ mask: true });
            wsstream.write(new Buffer(0));
        });

        it('should not set mask bit', function(done) {
            msocket.once('data', function(chunk) {
                var mask = chunk[1] & 0x80;

                mask.should.equal(0);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeHead({ mask: false });
            wsstream.write(new Buffer(0));
        });

        it('should set opcode to 0x00', function(done) {
            msocket.once('data', function(chunk) {
                var opcode = chunk[0] & 0x0f;
                
                opcode.should.equal(0x00);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeHead({ opcode: 0x00 });
            wsstream.write(new Buffer(0));
        });

        it('should set opcode 0x0a', function(done) {
            msocket.once('data', function(chunk) {
                var opcode = chunk[0] & 0x0f;
                
                opcode.should.equal(0x0a);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeHead({ opcode: 0x0a });
            wsstream.write(new Buffer(0));
        });
    
        it('should set length to 0', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;
                
                length.should.equal(0);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeHead({ length: 0 });
            wsstream.write(new Buffer(0));
        });
    
        it('should set length to 125', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;
                
                length.should.equal(125);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeHead({ length: 125 });
            wsstream.write(new Buffer(0));
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
            wsstream.writeHead({ length: 126 });
            wsstream.write(new Buffer(0));
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
            wsstream.writeHead({ length: 127 });
            wsstream.write(new Buffer(0));
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
            wsstream.writeHead({ length: 65535 });
            wsstream.write(new Buffer(0));
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
            wsstream.writeHead({ length: 65536 });
            wsstream.write(new Buffer(0));
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
            wsstream.writeHead({ length: 4294967295 });
            wsstream.write(new Buffer(0));
        });

        it('should have masking bytes, length == 125', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;

                length.should.equal(125);
                chunk.length.should.equal(6);
                
                done();
            });
            wsstream.writeHead({ mask: true, length: 125 });
            wsstream.write(new Buffer(0));
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
            wsstream.writeHead({ mask: true, length: 65535 });
            wsstream.write(new Buffer(0));
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
            wsstream.writeHead({ mask: true, length: 65536 });
            wsstream.write(new Buffer(0));
        });

        it('should use masking bytes from head', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;
                var masking = chunk.slice(2);

                chunk.length.should.equal(6);
                masking.toString('base64').should.equal('cyrADw==');

                done();
            });
            wsstream.writeHead({ mask: true, masking: new Buffer([0x73, 0x2a, 0xc0, 0x0f]) });
            wsstream.write(new Buffer(0));
        });

    });

});
