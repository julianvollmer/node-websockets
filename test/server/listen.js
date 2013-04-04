var http = require('http');

var WebSocketServer = require('../../lib/server');
var WebSocketUpgrade = require('../../lib/upgrade');

describe('WebSocketServer', function() {

    var server, ressource;

    beforeEach(function() {
        ressource = 'ws://localhost:3000';
        server = http.createServer().listen(3000);
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

