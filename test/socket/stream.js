var crypto = require('crypto');

var WebSocket = require('../../lib/socket');
var MockupSocket = require('../mockup/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Event: "stream:start"', function() {

        xit('should be emitted on start of frame stream', function(done) {
            wssocket.once('stream:start', function() {
                done();
            });

            msocket.push(new Buffer([0x02, 0x01, 0x48]));
        });

    });

    describe('Event: "stream:end"', function() {

        it('should be emitted on end of frame stream', function(done) {
            wssocket.once('stream:end', function() {
                wssocket.read().should.eql(new Buffer('Hey'));
                done();
            });

            msocket.push(new Buffer([0x02, 0x01, 0x48]));
            msocket.push(new Buffer([0x00, 0x01, 0x65]));
            msocket.push(new Buffer([0x80, 0x01, 0x79]));
        });

        xit('should be emitted on very large frame stream', function(done) {
            var heads = [];
            var buffer = [];
            heads[0] = new Buffer([0x02, 0x7e, 0x04, 0x00]);
            heads[1] = new Buffer([0x00, 0x7e, 0x04, 0x00]);
            heads[2] = new Buffer([0x00, 0x7e, 0x04, 0x00]);
            heads[3] = new Buffer([0x80, 0x7e, 0x04, 0x00]); 
                
            crypto.randomBytes(0x1000, function(err, payload) {

                wssocket.once('stream:start', function() {
                    wssocket.on('readable', function() {
                        var chunk = wssocket.read();
                        buffer.push(chunk);
                    });
                });
                
                wssocket.once('stream:end', function() {
                    Buffer.concat(buffer).should.eql(payload);
                    done();
                });

                msocket.push(Buffer.concat([heads[0], payload.slice(0, 0x400)]));
                msocket.push(Buffer.concat([heads[1], payload.slice(0x400, 0x800)]));
                msocket.push(Buffer.concat([heads[2], payload.slice(0x800, 0xc00)]));
                msocket.push(Buffer.concat([heads[3], payload.slice(0xc00)]));
            });
        });

    });

});
