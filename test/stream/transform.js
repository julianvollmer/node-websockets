var MockupSocket = require('../mockup/socket');

var WebSocketFrame = require('../../lib/frame');
var WebSocketStream = require('../../lib/stream');

describe('WebSocketStream', function() {

    var wsstream, msocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wsstream = new WebSocketStream();

        msocket.pipe(wsstream);
    });

    describe('#transform(chunk, encoding, done)', function() {
        it('should passthrough uncorrupted packages', function(done) {
            wsstream.once('data', function(frame) {
                frame.toString('base64').should.equal('gQNIZXk=');
                done();
            });
            msocket.write(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]));
        });
        it('should concat splitted data packages until they are complete', function(done) {
            wsstream.once('data', function(frame) {
                frame.toString('base64').should.equal('gQZIZWxsby4=');
                done();
            });
            msocket.write(new Buffer([0x81, 0x06, 0x48, 0x65]));
            msocket.write(new Buffer([0x6c, 0x6c, 0x6f, 0x2e]));
        });
        it('should split glued data packages until every data package is complete', function(done) {
            var counter = 0;
            wsstream.on('data', function(frame) {
                if (counter == 0) {
                    frame.toString('base64').should.equal('gQNIZXk=');
                    return counter++;
                }
                if (counter == 1) {
                    frame.toString('base64').should.equal('gQJIbw==');
                    done();
                }
            });
            msocket.write(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79, 0x81, 0x02, 0x48, 0x6f]));
        });
    });

});
