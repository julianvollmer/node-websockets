var http = require('http');

var mockupExtensions = require('../mockup/extensions');

var WebSocketServer = require('../../lib/server');
var WebSocketUpgrade = require('../../lib/upgrade');

describe('WebSocketServer', function() {

    var server, ressource;

    beforeEach(function() {
        server = http.createServer().listen(3000);
        ressource = 'ws://localhost:3000';
    });

    afterEach(function() {
        server.close();
    });
    
    describe('#listen()', function() {
        it('should listen on the defined url for upgrade requests', function(done) {
            var wss = new WebSocketServer({ url: ressource });
            wss.once('open', function() {
                done();
            });
            wss.listen(server);
            WebSocketUpgrade.createUpgradeRequest(ressource);
        });
        it('should listen on the defined url for upgrade requests (one extension)', function(done) {
            var wss = new WebSocketServer({ url: ressource });
            wss.once('message', function(message) {
                message.should.be.equal('Hellobubu');
                done();
            });
            wss.listen(server);
            wss.extensions['x-concat-bubu'] = mockupExtensions['x-concat-bubu'];
            WebSocketUpgrade.createUpgradeRequest(ressource, { extensions: ['x-concat-bubu'] }, function(err, socket) {
                socket.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
            });
        });
        it('should listen on the defined url for upgrade requests (two extensions)', function(done) {
            var wss = new WebSocketServer({ url: ressource });
            wss.once('message', function(message) {
                message.should.be.equal('Hellobubutaja');
                done();
            });
            wss.extensions = mockupExtensions;
            wss.listen(server);
            WebSocketUpgrade.createUpgradeRequest(ressource, { extensions: ['x-concat-bubu', 'x-concat-taja'] }, function(err, socket) {
                socket.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
            });
        });
        it('should only listen to upgrades on the defined url', function(done) {
            var wssOne = new WebSocketServer({ url: "ws://localhost:3000/images" });
            var wssTwo = new WebSocketServer({ url: "ws://localhost:3000/messages" });
            wssOne.once('open', function() {
               throw new Error('first ws server one should not listen on upgrade of ws server two');
            });
            wssTwo.once('open', function() {
                done();
            });
            wssOne.listen(server);
            wssTwo.listen(server);
            WebSocketUpgrade.createUpgradeRequest("ws://localhost:3000/messages");
        });
    });

});

