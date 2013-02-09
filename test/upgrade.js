var http = require('http');
var assert = require('assert');

var WebSocketUpgrade = require('../lib/upgrade');

// NOTE: tests not tested
describe('WebSocketUpgrade', function() {
   
    describe('#createUpgradeRequest()', function() {
        
        it('should send a ws upgrade request to a server', function(done) {
            var server = http.createServer();
            
            server.on('upgrade', function(req, socket) {
                var headers = req.headers;
                
                assert.equal(headers['upgrade'], 'websocket');
                assert.equal(headers['connection'], 'upgrade');
                //assert.equal(headers['sec-websocket-key'], 'string');
                assert.equal(headers['sec-websocket-version'], 13);
                
                done();
            });
            
            server.listen(3000);
            
            WebSocketUpgrade.createUpgradeRequest('ws://localhost:3000');
        });
        
    });
    
    describe('#handleUpgradeRequest()', function() {
    
        it('should read the ws upgrade request and send back a switching protocol response', function() {
            var server = http.createServer();
            
            server.on('upgrade', function(req, socket) {
                WebSocketUpgrade.handleUpgradeRequest(req, socket, function(socket) {
                    done();
                });
            });
            
            server.listen(3000);
            
            WebSocketUpgrade.createUpgradeRequest('ws://localhost:3000');
        });

    });
   
});