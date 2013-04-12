var crypto = require('crypto');

var MockupSocket = require('../mockup/socket');
var WebSocketCore = require('../../lib/core');

describe('WebSocketCore', function() {

    var frame, msocket, wscore;

    beforeEach(function() {
        msocket = new MockupSocket();
        wscore = new WebSocketCore(msocket);
    });
        
    describe('Event: "readable"', function() {

        it('should be emitted on frame body', function(done) {
            msocket.push(new Buffer([0x81, 0x03]));

            wscore.on('readable', function() {
                wscore.read().should.eql(new Buffer('Hey'));
                done();
            });

            msocket.push(new Buffer([0x48, 0x65, 0x79]));
        });

        it('should be emitted on body chunk', function(done) {
            msocket.push(new Buffer([0x82, 0x05]));

            wscore.once('readable', function() {
                wscore.read().should.eql(new Buffer('Hey'));
                done();
            });

            msocket.push(new Buffer('H'));
            msocket.push(new Buffer('e'));
            msocket.push(new Buffer('y'));
        });

        it('should be emitted with frame stream', function(done) {
            wscore.once('readable', function() {
                var chunk = wscore.read();
                    
                chunk.should.eql(new Buffer('Hello'));
                done();
            });

            msocket.push(new Buffer([0x01, 0x02, 0x48, 0x65]));
            msocket.push(new Buffer([0x80, 0x03, 0x6c, 0x6c, 0x6f]));
        });

        it('should be emitted on large frame', function(done) {
            var body = crypto.randomBytes(65535);
                
            var buffer = [];
            wscore.on('readable', function() {
                buffer.push(wscore.read());
            });
            wscore.on('end', function() {
                Buffer.concat(buffer).should.eql(body);
                done();
            });

            msocket.push(new Buffer([0x82, 0x7e, 0xff, 0xff]));
            msocket.push(body.slice(0, 0xff));
            msocket.push(body.slice(0xff));
            msocket.push(null);
        });

        it('should be emitted on large masked frame', function(done) {
            var head = new Buffer([0x82, 0xfe, 0xff, 0xff]);
            var mask = new Buffer([0xa9, 0x56, 0x4d, 0xf0]);
            var body = new Buffer(65535);
            var data = crypto.randomBytes(65535);

            // manuell mask
            for (var i = 0; i < data.length; i++)
                body[i] = data[i] ^ mask[i % 4];

            var buffer = [];
            wscore.on('readable', function() {
                var chunk = wscore.read();
                buffer.push(chunk);
            });
            wscore.on('end', function() {
                Buffer.concat(buffer).should.eql(data);
                done();
            });

            msocket.push(head);
            msocket.push(mask);
            msocket.push(body.slice(0, 0xff));
            msocket.push(body.slice(0xff));
            msocket.push(null);
        });

    });

});
