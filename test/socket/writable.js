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

        describe('#setOpcode(opcode)', function() {
        
            it('should change the opcode', function(done) {
                msocket.once('data', function(chunk) {
                    chunk[0].should.equal(0x82);
                    chunk[1].should.equal(0x32);
                    done();
                });
                
                wssocket.setOpcode(0x02);
                wssocket.writeEnd(crypto.randomBytes(50));
            });

            it('should not change opcode if reserved', function(done) {
                msocket.once('data', function(chunk) {
                    chunk[0].should.equal(0x81);
                    chunk[1].should.equal(0x32);
                    done();
                });
                
                wssocket.setOpcode(0x04);
                wssocket.writeEnd(crypto.randomBytes(50));
            });

            it('should not change opcode while in a stream', function(done) {
                var counter = 0;
                msocket.on('data', function(chunk) {
                    switch (counter) {
                        case 0:
                            chunk[0].should.equal(0x01);
                            chunk[1].should.equal(0x32);
                            break;
                        case 1:
                            chunk[0].should.equal(0x80);
                            chunk[1].should.equal(0x32);
                            done();
                            break;
                    }
                    counter++;
                });
                
                wssocket.write(crypto.randomBytes(50));
                wssocket.setOpcode(0x04);
                wssocket.writeEnd(crypto.randomBytes(50));
            });

        });

        describe('#write(chunk)', function() {

            it('should write first part of a frame stream', function(done) {
                msocket.once('data', function(frame) {
                    frame[0].should.equal(0x01);
                    frame[1].should.equal(0x01);
                    frame[2].should.equal(0x48);

                    done();
                });
                wssocket.write(new Buffer('H'));
            });

            it('should write some fragment of a frame stream', function(done) {
                var counter = -1;
                msocket.on('data', function(frame) {
                    switch (counter) {
                        case 0:
                            frame[0].should.equal(0x00);
                            frame[1].should.equal(0x02);
                            frame[2].should.equal(0x65);
                            frame[3].should.equal(0x6c);
                            break;
                        case 1:
                            frame[0].should.equal(0x00);
                            frame[1].should.equal(0x02);
                            frame[2].should.equal(0x6c);
                            frame[3].should.equal(0x6f);
                            done();
                            break;
                    }
                    counter++;
                });

                wssocket.write(new Buffer('H'));
                wssocket.write(new Buffer('el'));
                wssocket.write(new Buffer('lo'));
            });

        });

        describe('#writeEnd([chunk])', function() {

            it('should write an empty fin frame', function(done) {
                msocket.once('data', function(frame) {
                    frame[0].should.equal(0x81);
                    frame[1].should.equal(0x00);

                    done();
                });
                wssocket.writeEnd();
            });

            it('should write an simple text fin frame', function(done) {
                msocket.once('data', function(frame) {
                    frame[0].should.equal(0x81);
                    frame[1].should.equal(0x05);
                    frame[2].should.equal(0x48);
                    frame[3].should.equal(0x65);
                    frame[4].should.equal(0x6c);
                    frame[5].should.equal(0x6c);
                    frame[6].should.equal(0x6f);

                    done();
                });
                wssocket.writeEnd(new Buffer('Hello'));
            });

        });

        it('should stream some randomBytes', function(done) {
            wssocket = new WebSocket(msocket, { opcode: 0x02 });

            var counter = 0;
            var payload = crypto.randomBytes(2000);

            msocket.on('data', function(frame) { 
                var offset = counter * 500;
                var length = offset + 500;
                var body = payload.slice(offset, length);

                switch (counter) {
                    case 0:
                        var head = new Buffer([0x02, 0x7e, 0x01, 0xf4]);
                        frame.should.eql(Buffer.concat([head, body]));
                        break;
                    case 1:
                        var head = new Buffer([0x00, 0x7e, 0x01, 0xf4]);
                        frame.should.eql(Buffer.concat([head, body]));
                        break;
                    case 2:
                        var head = new Buffer([0x00, 0x7e, 0x01, 0xf4]);
                        frame.should.eql(Buffer.concat([head, body]));
                        break;
                    case 3:
                        var head = new Buffer([0x80, 0x7e, 0x01, 0xf4]);
                        frame.should.eql(Buffer.concat([head, body]));
                        done();
                        break;
                }

                counter++;
            });

            wssocket.write(new Buffer(payload.slice(000, 500)));
            wssocket.write(new Buffer(payload.slice(500, 1000)));
            wssocket.write(new Buffer(payload.slice(1000, 1500)));
            wssocket.writeEnd(new Buffer(payload.slice(1500, 2000)));
        });

    });

});
