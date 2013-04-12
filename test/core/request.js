var crypto = require('crypto');

var MockupSocket = require('../mockup/socket');
var WebSocketCore = require('../../lib/core');

describe('WebSocketCore', function() {

    var msocket, wscore;

    beforeEach(function() {
        msocket = new MockupSocket();
        wscore = new WebSocketCore(msocket);
    });

    describe('Event: "request"', function() {

        it('should be emitted on single frame head', function(done) {
            wscore.once('request', function(request) {
                request.should.have.property('opcode', 0x01);
                request.should.have.property('stream', false);
                done();
            });

            msocket.push(new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]));
        });
        
        it('should be emitted on two frame heads', function(done) {
            var counter = 0;
            wscore.on('request', function(request) {
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
            
            wscore.once('request', function(request) {
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
        
            wscore.once('request', function(request) {
                request.should.have.property('opcode', 0x01);
                request.should.have.property('stream', false);
                wscore.once('request', function(request) {
                    request.should.have.property('opcode', 0x01);
                    request.should.have.property('stream', false);
                    done();   
                });
            });

            msocket.push(Buffer.concat([frameOne, frameTwo]));
        });

    });

});
