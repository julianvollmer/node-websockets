var http = require('http');
var should = require('should');

var WebSocketServer = require('../lib/server');
var WebSocketUpgrade = require('../lib/upgrade');

describe('WebSocketServer', function() {

    var server;
    var ressource = 'ws://localhost:3000';

    beforeEach(function() {
        server = http.createServer().listen(3000);
    });

    afterEach(function() {
        server.close();
    });

    describe('#listen()', function() {
        it('should listen on the defined url for upgrade requests', function(done) {
            var wss = new WebSocketServer({ url: ressource });
            wss.on('open', function() {
                done();
            });
            wss.listen(server);
            WebSocketUpgrade.createUpgradeRequest(ressource);
        });
        it('should listen on the defined url for upgrade requests (one extension)', function(done) {
            var wss = new WebSocketServer({ url: ressource });
            wss.on('open', function() {
                done();
            });
            wss.listen(server);
            wss.addExtension('x-test', function() {});
            WebSocketUpgrade.createUpgradeRequest(ressource, { extensions: ['x-test'] });
        });
    });

});
