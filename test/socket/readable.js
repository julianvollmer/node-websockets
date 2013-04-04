var crypto = require('crypto');

var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var frame, msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Readable', function() {
        
        describe('Event: "head"', function() {

            it('should be triggered at on single frame head', function(done) {
                frame = new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);

                wssocket.once('head', function(head) {
                    head.should.have.property('opcode', 0x01);
                    head.should.have.property('stream', false);
                    done();
                });

                msocket.write(frame);
            });
            
            it('should be triggered at two frame heads', function(done) {
                var frameOne = new Buffer([0x81, 0x03, 0x48, 0x65, 0x78]);
                var frameTwo = new Buffer([0x82, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);

                var counter = 0;
                wssocket.on('head', function(head) {
                    switch (counter) {
                        case 0:
                            head.should.have.property('opcode', 0x01);
                            head.should.have.property('stream', false);
                            break;
                        case 1:
                            head.should.have.property('opcode', 0x02);
                            head.should.have.property('stream', false);
                            done();
                            break;
                    }
                    counter++;
                });

                msocket.write(frameOne);
                msocket.write(frameTwo);
            });

            it('should be triggered at a byted frame head', function(done) {
                var frameHead = new Buffer([0x82, 0x7e, 0x00, 0x7f]);
                var frameBody = crypto.randomBytes(127);
                
                wssocket.once('head', function(head) {
                    head.should.have.property('opcode', 0x02);
                    head.should.have.property('stream', false);
                    done();
                });

                var frameBytes = Buffer.concat([frameHead, frameBody]);
                
                for (var i = 0; i < frameBytes.length; i++)
                    msocket.write(new Buffer([frameBytes[i]]));
            });

            it('should be triggered at a chunked frame head', function(done) {
                var frameOne = new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]);
                var frameTwo = new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
            
                wssocket.once('head', function(head) {
                    head.should.have.property('opcode', 0x01);
                    head.should.have.property('stream', false);
                    wssocket.once('head', function(head) {
                        head.should.have.property('opcode', 0x01);
                        head.should.have.property('stream', false);
                        done();   
                    });
                });

                msocket.write(Buffer.concat([frameOne, frameTwo]));
            });

        });

        describe('Event: "done"', function() {

            it('should be emitted after frame body', function(done) {
                msocket.write(new Buffer([0x82, 0x7e, 0x01, 0x00]));
                msocket.write(crypto.randomBytes(0xff));

                wssocket.once('done', function() {
                    done();
                });

                msocket.write(new Buffer('z'));
            });

            it('should be emitted after frame stream', function(done) {
                msocket.write(new Buffer([0x01, 0x02, 0x48, 0x65]));

                wssocket.once('done', function() {
                    done();
                });

                msocket.write(new Buffer([0x80, 0x03, 0x6c, 0x6c, 0x6f]));
            });

        });

        describe('Event: "readable"', function() {

            it('should be emitted on frame body', function(done) {
                msocket.write(new Buffer([0x81, 0x03]));

                wssocket.once('readable', function() {
                    wssocket.read().should.eql(new Buffer('Hey'));
                    done();
                });

                msocket.write(new Buffer([0x48, 0x65, 0x79]));
            });

            it('should be emitted on body chunk', function(done) {
                msocket.write(new Buffer([0x82, 0x05]));

                wssocket.once('readable', function() {
                    var chunk = wssocket.read();
                    chunk.should.eql(new Buffer('Hey'));
                    done();
                });

                msocket.write(new Buffer('H'));
                msocket.write(new Buffer('e'));
                msocket.write(new Buffer('y'));
            });

            it('should be emitted with frame stream', function(done) {
                wssocket.once('readable', function() {
                    var chunk = wssocket.read();
                        
                    chunk.should.eql(new Buffer('Hello'));
                    done();
                });

                msocket.write(new Buffer([0x01, 0x02, 0x48, 0x65]));
                msocket.write(new Buffer([0x80, 0x03, 0x6c, 0x6c, 0x6f]));
            });
        });

    });

});
