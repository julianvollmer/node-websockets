var crypto = require('crypto');

var MockupSocket = require('../mockup/socket');
var WebSocketCore = require('../../lib/core');

describe('WebSocketCore', function() {

    var msocket, wscore;

    beforeEach(function() {
        msocket = new MockupSocket();
        wscore = new WebSocketCore(msocket);
    });

    describe('#write(chunk)', function() {

        it('should send an empty text frame', function(done) {
            msocket.once('data', function(chunk) {
                chunk[0].should.equal(0x81);
                chunk[1].should.equal(0x00);
                chunk.length.should.equal(2);
                done();
            });
            wscore.writeHead({ fin: true, opcode: 0x01, length: 0 });
            wscore.write(new Buffer(0));
        });

        it('should send a text frame with "Hello"', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x81);
                        chunk[1].should.equal(0x05);
                        break;
                    case 1:
                        chunk[0].should.equal(0x48);
                        chunk[1].should.equal(0x65);
                        chunk[2].should.equal(0x6c);
                        chunk[3].should.equal(0x6c);
                        chunk[4].should.equal(0x6f);
                        done();
                        break;
                        
                }
                counter++;
            });
            wscore.writeHead({ fin: true, opcode: 0x01, length: 5 });
            wscore.write(new Buffer('Hello'));
        });

        it('should send a large binary frame', function(done) {
            var payload = crypto.randomBytes(127);
            
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x82);
                        chunk[1].should.equal(0x7e);
                        chunk[2].should.equal(0x00);
                        chunk[3].should.equal(0x7f);
                        chunk.length.should.equal(4);
                        break;
                    case 1:
                        chunk.should.eql(payload);
                        done();
                        break;
                }
                counter++;
            });
            wscore.writeHead({ fin: true, opcode: 0x02, length: 127 });
            wscore.write(payload);
        });

        it('should send a stream of text frames', function(done) {
            var counter = 0;
            msocket.on('data', function(chunk) {
                switch (counter) {
                    case 0:
                        chunk[0].should.equal(0x01);
                        chunk[1].should.equal(0x05);
                        chunk.length.should.equal(2);
                        break;
                    case 1:
                        chunk.should.eql(new Buffer('Hello'));
                        break;
                    case 2:
                        chunk[0].should.equal(0x00);
                        chunk[1].should.equal(0x05);
                        chunk.length.should.equal(2);
                        break;
                    case 3:
                        chunk.should.eql(new Buffer('World'));
                        break;
                    case 4:
                        chunk[0].should.equal(0x00);
                        chunk[1].should.equal(0x05);
                        chunk.length.should.equal(2);
                        break;
                    case 5:
                        chunk.should.eql(new Buffer('Sugar'));
                        break;
                    case 6:
                        chunk[0].should.equal(0x80);
                        chunk[1].should.equal(0x04);
                        chunk.length.should.equal(2);
                        break;
                    case 7:
                        chunk.should.eql(new Buffer('Salt'));
                        done();
                        break;
                }
                counter++;
            });

            wscore.writeHead({ fin: false, opcode: 0x01, length: 5 });
            wscore.write(new Buffer('Hello'));

            wscore.writeHead({ fin: false, opcode: 0x00, length: 5 });
            wscore.write(new Buffer('World'));
            
            wscore.writeHead({ fin: false, opcode: 0x00, length: 5 });
            wscore.write(new Buffer('Sugar'));
            
            wscore.writeHead({ fin: true, opcode: 0x00, length: 4 });
            wscore.write(new Buffer('Salt'));
        });

        // TODO: the below does not work...
        it('should throw error if chunk.length > state.length', function() {
            (function() {
                wscore.writeHead({ fin: true, opcode: 0x01, length: 2 });
                wscore.write(new Buffer('Hey'));
             });
        });

    });

});
