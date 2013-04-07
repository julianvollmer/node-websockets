var crypto = require('crypto');

var MockupSocket = require('../mockup/socket');
var WebSocketStream = require('../../lib/stream');

describe('WebSocketStream', function() {

    var frame, msocket, wsstream;

    beforeEach(function() {
        msocket = new MockupSocket();
        wsstream = new WebSocketStream(msocket);
    });

    describe('Readable', function() {
        
        describe('Event: "request"', function() {

            it('should be emitted on single frame head', function(done) {
                wsstream.once('request', function(request) {
                    request.should.have.property('opcode', 0x01);
                    request.should.have.property('stream', false);
                    done();
                });

                msocket.push(new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]));
            });
            
            it('should be emitted on two frame heads', function(done) {
                var counter = 0;
                wsstream.on('request', function(request) {
                    switch (counter) {
                        case 0:
                            request.should.have.property('opcode', 0x01);
                            request.should.have.property('stream', false);
                            break;
                        case 1:
                            request.should.have.property('opcode', 0x02);
                            request.should.have.property('stream', false);
                            done();
                            break;
                    }
                    counter++;
                });

                msocket.push(new Buffer([0x81, 0x03, 0x48, 0x65, 0x78]));
                msocket.push(new Buffer([0x82, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]));
            });

            it('should be emitted on a byted frame head', function(done) {
                var frameHead = new Buffer([0x82, 0x7e, 0x00, 0x7f]);
                var frameBody = crypto.randomBytes(127);
                
                wsstream.once('request', function(request) {
                    request.should.have.property('opcode', 0x02);
                    request.should.have.property('stream', false);
                    done();
                });

                var frameBytes = Buffer.concat([frameHead, frameBody]);
                
                for (var i = 0; i < frameBytes.length; i++)
                    msocket.push(new Buffer([frameBytes[i]]));
            });

            it('should be emitted on a chunked frame head', function(done) {
                var frameOne = new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]);
                var frameTwo = new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
            
                wsstream.once('request', function(request) {
                    request.should.have.property('opcode', 0x01);
                    request.should.have.property('stream', false);
                    wsstream.once('request', function(request) {
                        request.should.have.property('opcode', 0x01);
                        request.should.have.property('stream', false);
                        done();   
                    });
                });

                msocket.push(Buffer.concat([frameOne, frameTwo]));
            });

        });

        describe('Event: "readable"', function() {

            it('should be emitted on frame body', function(done) {
                msocket.push(new Buffer([0x81, 0x03]));

                wsstream.on('readable', function() {
                    wsstream.read().should.eql(new Buffer('Hey'));
                    done();
                });

                msocket.push(new Buffer([0x48, 0x65, 0x79]));
            });

            it('should be emitted on body chunk', function(done) {
                msocket.push(new Buffer([0x82, 0x05]));

                wsstream.once('readable', function() {
                    wsstream.read().should.eql(new Buffer('Hey'));
                    done();
                });

                msocket.push(new Buffer('H'));
                msocket.push(new Buffer('e'));
                msocket.push(new Buffer('y'));
            });

            it('should be emitted with frame stream', function(done) {
                wsstream.once('readable', function() {
                    var chunk = wsstream.read();
                        
                    chunk.should.eql(new Buffer('Hello'));
                    done();
                });

                msocket.push(new Buffer([0x01, 0x02, 0x48, 0x65]));
                msocket.push(new Buffer([0x80, 0x03, 0x6c, 0x6c, 0x6f]));
            });

        });

    });

});
