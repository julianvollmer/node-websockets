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
            var wsserver = new WebSocketServer({ url: ressource });
            
            wsserver.once('open', function() {
                done();
            });
            
            wsserver.listen(server);
            WebSocketUpgrade.createUpgradeRequest(ressource);
        });

        it('should only listen to upgrades on the defined url', function(done) {
            var wsserverOne = new WebSocketServer({ url: "ws://localhost:3000/images" });
            var wsserverTwo = new WebSocketServer({ url: "ws://localhost:3000/messages" });
            
            wsserverOne.once('open', function() {
               throw new Error('first ws server one should not listen on upgrade of ws server two');
            });
            
            wsserverTwo.once('open', function() {
                done();
            });

            wsserverOne.listen(server);
            wsserverTwo.listen(server);
            
            WebSocketUpgrade.createUpgradeRequest("ws://localhost:3000/messages");
        });
    });

});

