var crypto = require('crypto');

var MSocket = require('./msocket');

var WebSocket = require('../../lib/socket');

describe('WebSocket', function() {

    var frame, msocket, wssocket;

    beforeEach(function() {
        msocket = new MSocket();
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

                msocket.push(frame);
            });
            
            it('should be triggered at two frame heads', function(done) {
                var frameOneHead = new Buffer([0x81, 0x05]);
                var frameOneBody = new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
                var frameTwoHead = new Buffer([0x82, 0x07e, 0x00, 0x7f]);
                var frameTwoBody = crypto.randomBytes(127);
                
                var frameOne = Buffer.concat([frameOneHead, frameOneBody]);
                var frameTwo = Buffer.concat([frameTwoHead, frameTwoBody]);

                wssocket.once('head', function(head) {
                    head.should.have.property('opcode', 0x01);
                    head.should.have.property('stream', false);
                    wssocket.once('head', function(head) {
                        head.should.have.property('opcode', 0x02);
                        head.should.have.property('stream', false);
                        done();   
                    });
                });

                msocket.push(frameOne);
                msocket.push(frameTwo);
            });

            it('should be triggered at a byted frame head', function(done) {
                var frameBytes = [0x81, 0x07e, 0x00, 0x7f];
                frameBytes.concat(crypto.randomBytes(127));

                wssocket.once('head', function(head) {
                    head.should.have.property('opcode', 0x01);
                    head.should.have.property('stream', false);
                    done();
                });

                frameBytes.forEach(function(frameByte) {
                    frame = new Buffer(1);
                    frame[0] = frameByte;
                    msocket.push(frame);
                });
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

                msocket.push(Buffer.concat([frameOne, frameTwo]));
            });

        });

        describe('Event: "done"', function() {

            it('should be emitted after frame body', function(done) {
                var frameHead = new Buffer([0x82, 0x7e, 0x01, 0x00]);
                var frameBody = crypto.randomBytes(0xff);

                msocket.push(frameHead);
                msocket.push(frameBody);

                wssocket.once('done', function() {
                    done();
                });

                msocket.push(new Buffer('z'));
            });

            it('should be emitted after frame stream', function(done) {
                var frameOne = new Buffer([0x01, 0x02, 0x48, 0x65]);
                var frameTwo = new Buffer([0x80, 0x03, 0x6c, 0x6c, 0x6f]);

                msocket.push(frameOne);

                wssocket.once('done', function() {
                    done();
                });

                msocket.push(frameTwo);
            });

        });

        describe('Event: "readable"', function() {

        });

    });

});
