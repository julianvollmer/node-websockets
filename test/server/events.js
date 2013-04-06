var WebSocket = require('../../lib/socket');
var WebSocketServer = require('../../lib/server');
var MockupSocket = require('../mockup/socket');

describe('WebSocketServer', function() {

    var msocket, wsserver;

    beforeEach(function() {
        msocket = new MockupSocket();
        wsserver = new WebSocketServer();
    });

    describe('event: "open"', function() {

        it('should be emitted on new connection', function(done) {
            wsserver.once('open', function(wssocket) {
                wssocket.should.be.an.instanceOf(WebSocket);
                done();
            });

            wsserver.assignSocket(msocket);
        });

    });
    
    describe('event: "pong"', function() {

        it('should be emitted on pong frame', function(done) {
            wsserver.assignSocket(msocket);

            wsserver.once('pong', function(message, wssocket) {
                wssocket.should.be.an.instanceOf(WebSocket);
                message.should.eql(new Buffer('Hey'));
                done(); 
            });
            
            msocket.push(new Buffer([0x8a, 0x03, 0x48, 0x65, 0x79]));
        });

    });
    
    describe('event: "close"', function() {

        it('should be emitted after connection close', function(done) {    
            wsserver.assignSocket(msocket);
            
            wsserver.once('close', function(message, wssocket) {
                wssocket.should.be.an.instanceOf(WebSocket);
                message.should.eql(new Buffer([0x03, 0xe9]));
                done();
            });
            
            msocket.push(new Buffer([0x88, 0x02, 0x03, 0xe9]));
        });

    });

});
