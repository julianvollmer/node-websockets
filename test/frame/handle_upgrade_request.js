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

    describe('#handleUpgradeRequest()', function() {
        it('should pass a socket object to the optional callback', function(done) {
            server.once('upgrade', function(req, socket) {
                WebSocketUpgrade.handleUpgradeRequest(req, socket, function(socket) {
                    socket.should.be.an.instanceOf(net.Socket);
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
                res.should.have.status(101);
                res.should.have.header('upgrade', 'websocket');
                res.should.have.header('connection', 'upgrade');
                res.should.have.header('sec-websocket-accept');
                done();     
            });
        });
        it('should send back a valid http websocket upgrade response (with one extension)', function(done) {
            server.once('upgrade', function(req, socket) {
                WebSocketUpgrade.handleUpgradeRequest(req, socket, { extensions: exten });
            });
            WebSocketUpgrade.createUpgradeRequest(url, { extensions: exten }, function(res, socket) {
                res.should.have.status(101);
                res.should.have.header('upgrade', 'websocket');
                res.should.have.header('connection', 'upgrade');
                res.should.have.header('sec-websocket-accept');
                res.should.have.header('sec-websocket-extensions', 'x-test-one');
                done();     
            });
        });
        it('should send back a valid http websocket upgrade response (with two extensions)', function(done) {
            server.once('upgrade', function(req, socket) {
                WebSocketUpgrade.handleUpgradeRequest(req, socket, { extensions: extens });
            });
            WebSocketUpgrade.createUpgradeRequest(url, { extensions: extens }, function(res, socket) {
                res.should.have.status(101);
                res.should.have.header('upgrade', 'websocket');
                res.should.have.header('connection', 'upgrade');
                res.should.have.header('sec-websocket-accept');
                res.should.have.header('sec-websocket-extensions', 'x-test-one;x-test-two');
                done();     
            });
        });
    });

});
