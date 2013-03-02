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
            http.get({
                port: "3000",
                path: "/",
                headers: {
                    "Host": "localhost",
                    "Upgrade": "websocket",
                    "Connection": "Upgrade",
                    "Sec-WebSocket-Key": "x3JJHMbDL1EzLkh9GBhXDw==",
                    "Sec-WebSocket-Version": "13"
                }
            }).once('upgrade', function(res, socket) {
                res.should.have.status(101);
                res.should.have.header('Upgrade', 'websocket');
                res.should.have.header('Connection', 'Upgrade');
                res.should.have.header('Sec-WebSocket-Accept', 'HSmrc0sMlYUkAGmm5OPpG2HaGWk=');
                res.should.have.header('Sec-WebSocket-Version', '13');
                res.headers.should.not.have.property('Sec-WebSocket-Extensions');
                done();
            });
        });
 
        it('should set extension header if no extension on server but on client', function(done) {
            server.once('upgrade', function(req, socket) {
                WebSocketUpgrade.handleUpgradeRequest(req, socket, function(socket, options) {
                    options.should.not.have.property('extensions');
                });
            });
            http.get({
                port: "3000",
                path: "/",
                headers: {
                    "Host": "localhost",
                    "Upgrade": "websocket",
                    "Connection": "Upgrade",
                    "Sec-WebSocket-Key": "x3JJHMbDL1EzLkh9GBhXDw==",
                    "Sec-WebSocket-Version": "13",
                    "Sec-WebSocket-Extensions": "x-test"
                }
            }).once('upgrade', function(res, socket) {
                res.should.have.status(101);
                res.should.have.header('Upgrade', 'websocket');
                res.should.have.header('Connection', 'Upgrade');
                res.should.have.header('Sec-WebSocket-Accept', 'HSmrc0sMlYUkAGmm5OPpG2HaGWk=');
                res.should.have.header('Sec-WebSocket-Version', '13');
                res.headers.should.not.have.property('Sec-WebSocket-Extensions');
                done();
            });
        });

        it('should set extension header if client and server support same extension', function(done) {
            server.once('upgrade', function(req, socket) {
                var options = { extensions: ['x-test'] };
                WebSocketUpgrade.handleUpgradeRequest(req, socket, options, function(socket, options) {
                    options.should.have.property('extensions');
                    options.extensions.should.include('x-test');
                });
            });
            http.get({
                port: "3000",
                path: "/",
                headers: {
                    "Host": "localhost",
                    "Upgrade": "websocket",
                    "Connection": "Upgrade",
                    "Sec-WebSocket-Key": "x3JJHMbDL1EzLkh9GBhXDw==",
                    "Sec-WebSocket-Version": "13",
                    "Sec-WebSocket-Extensions": "x-test"
                }
            }).once('upgrade', function(res, socket) {
                res.should.have.status(101);
                res.should.have.header('Upgrade', 'websocket');
                res.should.have.header('Connection', 'Upgrade');
                res.should.have.header('Sec-WebSocket-Accept', 'HSmrc0sMlYUkAGmm5OPpG2HaGWk=');
                res.should.have.header('Sec-WebSocket-Version', '13');
                res.should.have.header('Sec-WebSocket-Extensions', 'x-test');
                done();
            });
        });
        
        it('should set extension header if client and server support same extensions', function(done) {
            server.once('upgrade', function(req, socket) {
                var options = { extensions: ['x-test-one', 'x-test-two'] };
                WebSocketUpgrade.handleUpgradeRequest(req, socket, options, function(socket, options) {
                    options.should.have.property('extensions');
                    options.extensions.should.include('x-test-one');
                    options.extensions.should.include('x-test-two');
                });
            });
            http.get({
                port: "3000",
                path: "/",
                headers: {
                    "Host": "localhost",
                    "Upgrade": "websocket",
                    "Connection": "Upgrade",
                    "Sec-WebSocket-Key": "x3JJHMbDL1EzLkh9GBhXDw==",
                    "Sec-WebSocket-Version": "13",
                    "Sec-WebSocket-Extensions": "x-test-one; x-test-two"
                }
            }).once('upgrade', function(res, socket) {
                res.should.have.status(101);
                res.should.have.header('Upgrade', 'websocket');
                res.should.have.header('Connection', 'Upgrade');
                res.should.have.header('Sec-WebSocket-Accept', 'HSmrc0sMlYUkAGmm5OPpG2HaGWk=');
                res.should.have.header('Sec-WebSocket-Version', '13');
                res.should.have.header('Sec-WebSocket-Extensions', 'x-test-one;x-test-two');
                done();
            });
        });

    });
    
});
