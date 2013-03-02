var net = require('net');
var http = require('http');
var stream = require('stream');
var should = require('should');

var WebSocketUpgrade = require('../../lib/upgrade');

describe('WebSocketUpgrade', function() {
   
    var server;
    var url = 'ws://localhost:3000';
    var exten = [{ name: "x-test-one", enabled: true, read: function() {}, write: function() {} }];
    var extens = exten.concat({ name: "x-test-two", enabled: true, read: function() {}, write: function() {} });

    beforeEach(function() {
	    server  = http.createServer().listen(3000);
    });

    afterEach(function() {
        server.close();
    });

    describe('#createUpgradeRequest()', function() {
        it('should send a valid upgrade request to the http server', function(done) {
            server.once('upgrade', function(req, socket) {
                req.method.should.equal('GET');
                req.should.have.header('upgrade', 'websocket');
                req.should.have.header('connection', 'Upgrade');
                req.should.have.header('sec-websocket-key');
                req.should.have.header('sec-websocket-version', '13');
                done();
            });
            WebSocketUpgrade.createUpgradeRequest(url);
        });
        it('should send a valid upgrade request to the http server (with one extension)', function(done) {
            server.once('upgrade', function(req, socket) {
                req.method.should.equal('GET');
                req.should.have.header('upgrade', 'websocket');
                req.should.have.header('connection', 'Upgrade');
                req.should.have.header('sec-websocket-key');
                req.should.have.header('sec-websocket-version', '13');
                req.should.have.header('sec-websocket-extensions', 'x-test-one');                
                done();
            });
            WebSocketUpgrade.createUpgradeRequest(url, { extensions: exten });
        });
        it('should send a valid upgrade request to the http server (with two extensions)', function(done) {
            server.once('upgrade', function(req, socket) {
                req.method.should.equal('GET');
                req.should.have.header('upgrade', 'websocket');
                req.should.have.header('connection', 'Upgrade');
                req.should.have.header('sec-websocket-key');
                req.should.have.header('sec-websocket-version', '13');
                req.should.have.header('sec-websocket-extensions', 'x-test-one;x-test-two');                
                done();
            });
            WebSocketUpgrade.createUpgradeRequest(url, { extensions: extens });
        });
        it('should pass response and socket object to optional callback', function(done) {
            server.once('upgrade', function(req, socket) {
                req.method.should.equal('GET');
                req.should.have.header('upgrade', 'websocket');
                req.should.have.header('connection', 'Upgrade');
                req.should.have.header('sec-websocket-key');
                req.should.have.header('sec-websocket-version', '13');
                WebSocketUpgrade.handleUpgradeRequest(req, socket);
            });
            WebSocketUpgrade.createUpgradeRequest(url, function(res, socket) {
                res.should.be.an.instanceOf(stream.Stream);
                socket.should.be.an.instanceOf(net.Socket);
                done();
            });
        });
    });
    
});
