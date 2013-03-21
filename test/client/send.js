var should = require('should');

var MockupSocket = require('../mockup/socket');

var WebSocketFrame = require('../../lib/frame');
var WebSocketClient = require('../../lib/client');

describe('WebSocketClient', function() {

    var wsclient, msocket;
        
    before(function() {
        msocket = new MockupSocket();
        wsclient = new WebSocketClient();
        wsclient.assignSocket(msocket);
    });

    describe('#send(message)', function() {
        it('should send a masked text frame containing "Hello" through the socket', function(done) {
            msocket.once('data', function(data) {
                var wsframe = new WebSocketFrame(data);
                wsframe.fin.should.be.true;
                wsframe.mask.should.be.true;
                wsframe.content.toString().should.equal('Hello');
                done();
            });
            wsclient.send('Hello');
        });
    });

});
