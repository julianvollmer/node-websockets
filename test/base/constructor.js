var WebSocketBase = require('../../lib/base');

describe('WebSocketBase', function() {

    var wsbase;

    describe('#constructor([options])', function() {
        it('should set default parameters', function() {
            wsbase = new WebSocketBase();
            wsbase.mask.should.be.false;
            wsbase.timeout.should.equal(600000);
            wsbase.connections.should.equal(0);
            wsbase.maxConnections.should.equal(10);
            wsbase.sockets.should.be.an.instanceOf(Array);
            wsbase.extensions.should.be.an.instanceOf(Object);
            wsbase.url.protocol.should.equal('ws:');
            wsbase.url.hostname.should.equal('localhost');
        });
        it('should overwrite url on options', function() {
            wsbase = new WebSocketBase({ url: "ws://example.com:467/grinch" });
            wsbase.url.href.should.equal('ws://example.com:467/grinch');
        });
        it('should overwrite mask on options', function() {
            wsbase = new WebSocketBase({ mask: true });
            wsbase.mask.should.be.true;
        });
        it('should overwrite timeout on options', function() {
            wsbase = new WebSocketBase({ timeout: 60000 });
            wsbase.timeout.should.equal(60000);
        });
        it('should overwrite maxConnections on options', function() {
            wsbase = new WebSocketBase({ maxConnections: 5 });
            wsbase.maxConnections.should.equal(5);
        });
    });

});
