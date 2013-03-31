var MockupSocket = require('./msocket');
var WebSocketStream = require('../../lib/stream');

describe('WebSocketStream', function() {

    var msocket, wsstream;

    beforeEach(function() {
        msocket = new MockupSocket();
        wsstream = new WebSocketStream(msocket);
    });

    describe('writing head bytes', function() {

        it('should set fin bit', function(done) {
            msocket.once('data', function(chunk) {
                var fin = chunk[0] & 0x80;
                
                fin.should.equal(0x80);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeFrameState.fin = true;
            wsstream.write(new Buffer(0));
        });

        it('should not set fin bit', function(done) {
            msocket.once('data', function(chunk) {
                var fin = chunk[0] & 0x80;
                
                fin.should.equal(0);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeFrameState.fin = false;
            wsstream.write(new Buffer(0));
        });

        it('should set mask bit', function(done) {
            msocket.once('data', function(chunk) {
                var mask = chunk[1] & 0x80;
                
                mask.should.equal(0x80);
                chunk.length.should.equal(6);
                
                done();
            });
            wsstream.writeFrameState.mask = true;
            wsstream.write(new Buffer(0));
        });

        it('should not set mask bit', function(done) {
            msocket.once('data', function(chunk) {
                var mask = chunk[1] & 0x80;

                mask.should.equal(0);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeFrameState.mask = false;
            wsstream.write(new Buffer(0));
        });

        it('should set opcode to 0x00', function(done) {
            msocket.once('data', function(chunk) {
                var opcode = chunk[0] & 0x0f;
                
                opcode.should.equal(0x00);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeFrameState.opcode = 0x00;
            wsstream.write(new Buffer(0));
        });

        it('should set opcode 0x0a', function(done) {
            msocket.once('data', function(chunk) {
                var opcode = chunk[0] & 0x0f;
                
                opcode.should.equal(0x0a);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.writeFrameState.opcode = 0x0a;
            wsstream.write(new Buffer(0));
        });
    
        it('should set length to 0', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;
                
                length.should.equal(0);
                chunk.length.should.equal(2);
                
                done();
            });
            wsstream.write(new Buffer(0));
        });
    
        it('should set length to 125', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;
                
                length.should.equal(125);
                chunk.length.should.equal(127);
                
                done();
            });
            wsstream.write(new Buffer(125));
        });

        it('should set length to 126', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt16BE(2);

                hlength.should.equal(126);
                plength.should.equal(126);
                chunk.length.should.equal(130);
                
                done();
            });
            wsstream.write(new Buffer(126));
        });
    
        it('should set length to 127', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt16BE(2);

                hlength.should.equal(126);
                plength.should.equal(127);
                chunk.length.should.equal(131);
                
                done();
            });
            wsstream.write(new Buffer(127));
        });
        
        it('should set length to 65535', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt16BE(2);

                hlength.should.equal(126);
                plength.should.equal(65535);
                chunk.length.should.equal(65539);
                
                done();
            });
            wsstream.write(new Buffer(65535));
        });
    
        it('should set length to 65536', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt32BE(6);

                hlength.should.equal(127);
                plength.should.equal(65536);
                chunk.length.should.equal(65546);
                
                done();
            });
            wsstream.write(new Buffer(65536));
        });

        // exceeds v8 object limit (the buffer)
        // TODO: throw error check
        xit('should set length to 4294967295', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt32BE(6);

                hlength.should.equal(127);
                plength.should.equal(4294967295);
                chunk.length.should.equal(10);
                
                done();
            });
            wsstream.write(new Buffer(4294967295));
        });

        it('should have masking bytes, length == 125', function(done) {
            msocket.once('data', function(chunk) {
                var length = chunk[1] & 0x7f;

                length.should.equal(125);
                chunk.length.should.equal(131);
                
                done();
            });
            wsstream.writeFrameState.mask = true;
            wsstream.write(new Buffer(125));
        });

        it('should have masking bytes, length == 65535', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt16BE(2);

                hlength.should.equal(126);
                plength.should.equal(65535);
                chunk.length.should.equal(65543);
                
                done();
            });
            wsstream.writeFrameState.mask = true;
            wsstream.write(new Buffer(65535));
        });

        it('should have masking bytes, length == 65536', function(done) {
            msocket.once('data', function(chunk) {
                var hlength = chunk[1] & 0x7f;
                var plength = chunk.readUInt32BE(6);

                hlength.should.equal(127);
                plength.should.equal(65536);
                chunk.length.should.equal(65550);
                
                done();
            });
            wsstream.writeFrameState.mask = true;
            wsstream.write(new Buffer(65536));
        });

    });

});
