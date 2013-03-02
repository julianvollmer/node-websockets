var http = require('http');
var should = require('should');

var WebSocketUpgrade = require('../../lib/upgrade');
var MockupExtensions = require('../mockup/extensions');

describe('WebSocketUpgrade', function() {
   
    var server;
    var url = 'ws://localhost:3000';

    beforeEach(function() {
	    server  = http.createServer().listen(3000);
    });

    afterEach(function() {
        server.close();
    });

    describe('#handleUpgradeRequest()', function() {
 
        it('should send an upgrade response to the client', function(done) {
            server.once('upgrade', function(req, socket) {
                WebSocketUpgrade.handleUpgradeRequest(req, socket);
            });
           
            var request = http.request({
                port: "3000",
                path: "/",
                method: "GET",
                headers: {
                    "Host": "localhost",
                    "Upgrade": "websocket",
                    "Connection": "Upgrade",
                    "Sec-WebSocket-Key": "x3JJHMbDL1EzLkh9GBhXDw==",
                    "Sec-WebSocket-Version": "13"
                }
            });

            request.once('upgrade', function(res, socket) {
                res.statusCode.should.equal(101);
                res.should.have.header('Upgrade', 'websocket');
                res.should.have.header('Connection', 'Upgrade');
                res.should.have.header('Sec-WebSocket-Accept', 'HSmrc0sMlYUkAGmm5OPpG2HaGWk=');
                res.should.have.header('Sec-WebSocket-Version', '13');
                done();
            });

            request.end();
        });
 
    });
    
});
