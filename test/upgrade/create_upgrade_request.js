var net = require('net');
var http = require('http');
var stream = require('stream');
var should = require('should');

var Socket = net.Socket;

var WebSocketUpgrade = require('../../lib/upgrade');

describe('WebSocketUpgrade', function() {
   
    var url, server;

    beforeEach(function() {
        url = 'ws://localhost:3000';
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
                req.should.have.header('sec-websocket-extensions', 'x-test');                
                done();
            });
            WebSocketUpgrade.createUpgradeRequest(url, { extensions: ['x-test'] }, function(socket, settings) {
                settings.should.have.property('extensions');
                settings.extensions.should.include('x-test');
            });
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
            WebSocketUpgrade.createUpgradeRequest(url, { extensions: ['x-test-one', 'x-test-two'] }, function(socket, settings) {
                settings.should.have.property('extensions');
                settings.extensions.should.include('x-test-one');
                settings.extensions.should.include('x-test-two');
            });
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
            WebSocketUpgrade.createUpgradeRequest(url, function(socket, settings) {
                socket.should.be.an.instanceOf(Socket);
                settings.should.be.an.instanceOf(Object);
                done();
            });
        });
    });
    
});
