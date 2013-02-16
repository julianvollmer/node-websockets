var http = require('http');
var assert = require('assert');
var should = require('should');

var WebSocketUpgrade = require('../lib/upgrade');

// NOTE: tests not tested
describe('WebSocketUpgrade', function() {
   
    var server;
    var url = 'ws://localhost:3000';

    beforeEach(function() {
	    server  = http.createServer().listen(3000);
    });

    afterEach(function() {
        // close the server
        server.close();
    });

    describe('#createUpgradeRequest()', function() {
       
        it('should send a ws upgrade request to a server', function(done) {
            server.once('upgrade', function(req, socket) {
                req.method.should.equal('GET');
                req.headers.should.have.property('upgrade', 'websocket');
                req.headers.should.have.property('connection', 'upgrade');
                req.headers.should.have.property('sec-websocket-key');
                req.headers.should.have.property('sec-websocket-version', '13');

                done();
            });
            
            WebSocketUpgrade.createUpgradeRequest(url);
        });
        
    });
    
    describe('#handleUpgradeRequest()', function() {

        it('should read the ws upgrade request and call the optional callback', function(done) {
            server.once('upgrade', function(req, socket) {
                WebSocketUpgrade.handleUpgradeRequest(req, socket, function(socket) {
                    done();
                });
            });
            
            WebSocketUpgrade.createUpgradeRequest(url);
        });

        it('should send back a valid http websocket upgrade response', function(done) {
            server.once('upgrade', function(req, socket) {
                WebSocketUpgrade.handleUpgradeRequest(req, socket);
            });
            
            WebSocketUpgrade.createUpgradeRequest(url, function(res, socket) {
                res.statusCode.should.equal(101);
                
                res.headers.should.have.property('upgrade', 'websocket');
                res.headers.should.have.property('connection', 'upgrade');
                res.headers.should.have.property('sec-websocket-accept');

                done();     
            });
        });

    });

});
