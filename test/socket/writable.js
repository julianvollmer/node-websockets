var crypto = require('crypto');

var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Writable', function() {

        describe('#writeHead(options)', function() {

            it('should set fin flag', function() {
                wssocket.writeHead({ fin: true });
                wssocket._frameWriteState.fin.should.be.true;
            });

            it('should set rsv1 flag', function() {
                wssocket.writeHead({ rsv1: true });
                wssocket._frameWriteState.rsv1.should.be.true;
            });

            it('should set rsv2 flag', function() {
                wssocket.writeHead({ rsv2: true });
                wssocket._frameWriteState.rsv2.should.be.true;
            });

            it('should set rsv3 flag', function() {
                wssocket.writeHead({ rsv3: true });
                wssocket._frameWriteState.rsv3.should.be.true;
            });

            it('should set mask flag', function() {
                wssocket.writeHead({ mask: true });
                wssocket._frameWriteState.mask.should.be.true;
            });

            it('should set opcode to 0x00', function() {
                wssocket.writeHead({ opcode: 0x00 });
                wssocket._frameWriteState.opcode.should.equal(0x00);
            });
            
            it('should set opcode to 0x0a', function() {
                wssocket.writeHead({ opcode: 0x0a });
                wssocket._frameWriteState.opcode.should.equal(0x0a);
            });

            it('should set masking to 0x7e 0xdf 0x20 0xf5', function() {
                var masking = new Buffer([0x7e, 0xdf, 0x20, 0xf5]);
                wssocket.writeHead({ masking: masking });
                wssocket._frameWriteState.mask.should.be.true;
                wssocket._frameWriteState.masking.should.eql(masking);
            });

        });

        describe('#write(chunk)', function() {

            it('should send an empty text frame', function(done) {
                msocket.once('data', function(chunk) {
                    chunk[0].should.equal(0x81);
                    chunk[1].should.equal(0x00);
                    chunk.length.should.equal(2);
                    done();
                });
                wssocket.writeHead({ fin: true, opcode: 0x01 });
                wssocket.write(new Buffer(0));
            });

            it('should send a text frame with "Hello"', function(done) {
                msocket.once('data', function(chunk) {
                    chunk[0].should.equal(0x81);
                    chunk[1].should.equal(0x05);
                    chunk[2].should.equal(0x48);
                    chunk[3].should.equal(0x65);
                    chunk[4].should.equal(0x6c);
                    chunk[5].should.equal(0x6c);
                    chunk[6].should.equal(0x6f);
                    chunk.length.should.equal(7);
                    done();
                });
                wssocket.writeHead({ fin: true, opcode: 0x01 });
                wssocket.write(new Buffer('Hello'));
            });

            it('should send a large binary frame', function(done) {
                var payload = crypto.randomBytes(127);
                msocket.once('data', function(chunk) {
                    chunk[0].should.equal(0x82);
                    chunk[1].should.equal(0x7e);
                    chunk[2].should.equal(0x00);
                    chunk[3].should.equal(0x7f);
                    chunk.length.should.equal(131);
                    chunk.slice(4).should.eql(payload);
                    done();
                });
                wssocket.writeHead({ fin: true, opcode: 0x02 });
                wssocket.write(payload);
            });

            it('should send a stream of text frames', function(done) {
                var counter = 0;
                msocket.on('data', function(chunk) {
                    switch (counter) {
                        case 0:
                            chunk[0].should.equal(0x01);
                            chunk[1].should.equal(0x05);
                            chunk.slice(2).should.eql(new Buffer('Hello'));
                            break;
                        case 1:
                            chunk[0].should.equal(0x00);
                            chunk[1].should.equal(0x05);
                            chunk.slice(2).should.eql(new Buffer('World'));
                            break;
                        case 2:
                            chunk[0].should.equal(0x00);
                            chunk[1].should.equal(0x05);
                            chunk.slice(2).should.eql(new Buffer('Sugar'));
                            break;
                        case 3:
                            chunk[0].should.equal(0x80);
                            chunk[1].should.equal(0x04);
                            chunk.slice(2).should.eql(new Buffer('Salt'));
                            done();
                            break;
                    }
                    counter++;
                });

                wssocket.writeHead({ fin: false, opcode: 0x01 });
                wssocket.write(new Buffer('Hello'));

                wssocket.writeHead({ fin: false, opcode: 0x00 });
                wssocket.write(new Buffer('World'));
                
                wssocket.writeHead({ fin: false, opcode: 0x00 });
                wssocket.write(new Buffer('Sugar'));
                
                wssocket.writeHead({ fin: true, opcode: 0x00 });
                wssocket.write(new Buffer('Salt'));
            });

        });

    });

});
