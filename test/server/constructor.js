var WebSocketServer = require('../../lib/server');

describe('WebSocketServer', function() {

    var wsserver;

    describe('#constructor([options])', function() {

        it('should set default parameters', function() {
            wsserver = new WebSocketServer();
            wsserver.mask.should.be.false;
            wsserver.timeout.should.equal(600000);
            wsserver.connections.should.equal(0);
            wsserver.maxConnections.should.equal(10);
            wsserver.sockets.should.be.an.instanceOf(Array);
            wsserver.url.protocol.should.equal('ws:');
            wsserver.url.hostname.should.equal('localhost');
        });

        it('should overwrite url on options', function() {
            wsserver = new WebSocketServer({ url: "ws://example.com:467/grinch" });
            wsserver.url.href.should.equal('ws://example.com:467/grinch');
        });
        
        it('should overwrite timeout on options', function() {
            wsserver = new WebSocketServer({ timeout: 60000 });
            wsserver.timeout.should.equal(60000);
        });
        
        it('should overwrite maxConnections on options', function() {
            wsserver = new WebSocketServer({ maxConnections: 5 });
            wsserver.maxConnections.should.equal(5);
        });
    
    });

});
