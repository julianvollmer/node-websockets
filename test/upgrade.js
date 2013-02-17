var http = require('http');
var assert = require('assert');
var should = require('should');

var WebSocketUpgrade = require('../lib/upgrade');

// NOTE: tests not tested
describe('WebSocketUpgrade', function() {
   
    var server;
    var url = 'ws://localhost:3000';
    var extens = [{ name: "x-test", enabled: true, read: function() {}, write: function() {} }];

    beforeEach(function() {
	    server  = http.createServer().listen(3000);
    });

    afterEach(function() {
        // close the server
        server.close();
    });

    describe('#createUpgradeRequest()', function() {
       
        it('should send a valid upgrade request to the http server', function(done) {
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

        it('should send a valid upgrade request to the http server (with one extension)', function(done) {
            server.once('upgrade', function(req, socket) {
                req.method.should.equal('GET');
                req.headers.should.have.property('upgrade', 'websocket');
                req.headers.should.have.property('connection', 'upgrade');
                req.headers.should.have.property('sec-websocket-key');
                req.headers.should.have.property('sec-websocket-version', '13');
                req.headers.should.have.property('sec-websocket-extensions', 'x-test');                

                done();
            });

            WebSocketUpgrade.createUpgradeRequest(url, { extensions: extens });
        });
        
    });
    
    describe('#handleUpgradeRequest()', function() {

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

        it('should send back a valid http websocket upgrade response (with one extension)', function(done) {
            server.once('upgrade', function(req, socket) {
                WebSocketUpgrade.handleUpgradeRequest(req, socket, { extensions: extens });
            });
            
            WebSocketUpgrade.createUpgradeRequest(url, { extensions: extens }, function(res, socket) {
                res.statusCode.should.equal(101);
                
                res.headers.should.have.property('upgrade', 'websocket');
                res.headers.should.have.property('connection', 'upgrade');
                res.headers.should.have.property('sec-websocket-accept');
                res.headers.should.have.property('sec-websocket-extensions', 'x-test');

                done();     
            });
        });

    });

});
