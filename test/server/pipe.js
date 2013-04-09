var crypto = require('crypto');

var WebSocketServer = require('../../lib/server');
var MockupSocket = require('../mockup/socket');

describe('WebSocketServer', function() {

    var wsserver, msocketOne, msocketTwo;

    beforeEach(function() {
        wsserver = new WebSocketServer();
        msocketOne = new MockupSocket();
        msocketTwo = new MockupSocket();

        wsserver.assignSocket(msocketOne);
        wsserver.assignSocket(msocketTwo);
    });

    describe('#wssocket.pipe(wsserver)', function() {
    
        it('should write incoming frame to all clients', function(done) {
            wsserver.once('stream:start', function(wssocket) {
                wssocket.pipe(wsserver);
            });
            wsserver.once('stream:end', function(wssocket) {
                wssocket.unpipe(wsserver);
            });
            
            var counterOne = 0;
            msocketOne.on('data', function(chunk) {
                switch (counterOne) {
                    case 0:
                        chunk[0].should.equal(0x02);
                        chunk[1].should.equal(0x7e);
                        chunk[2].should.equal(0xff);
                        chunk[3].should.equal(0xff);
                        chunk.slice(4).should.eql(payload);
                        break;
                    case 1:
                        chunk[0].should.equal(0x80);
                        chunk[1].should.equal(0x00);
                        chunk.length.should.equal(2);
                        break;
                }
                counterOne++;
            });

            var counterTwo = 0;
            msocketTwo.on('data', function(chunk) {
                switch (counterTwo) {
                    case 0:
                        chunk[0].should.equal(0x02);
                        chunk[1].should.equal(0x7e);
                        chunk[2].should.equal(0xff);
                        chunk[3].should.equal(0xff);
                        chunk.slice(4).should.eql(payload);
                        break;
                    case 1:
                        chunk[0].should.equal(0x80);
                        chunk[1].should.equal(0x00);
                        chunk.length.should.equal(2);
                        done();
                        break;
                }
                counterTwo++;
            });

            var payload = crypto.randomBytes(65535);
            msocketOne.push(new Buffer([0x82, 0x7e, 0xff, 0xff]));
            msocketOne.push(payload);
        });

    });

});
