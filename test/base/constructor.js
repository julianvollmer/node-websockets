var should = require('should');

var WebSocketBase = require('../../lib/base');

describe('WebSocketBase', function() {

    var wsb;

    describe('#constructor([options])', function() {
        it('should set default parameters', function() {
            wsb = new WebSocketBase();
            wsb.mask.should.be.false;
            wsb.timeout.should.equal(600000);
            wsb.connections.should.equal(0);
            wsb.maxConnections.should.equal(10);
            wsb.sockets.should.be.an.instanceOf(Object);
            wsb.socketsHistory.should.be.empty;
            wsb.socketsHistory.should.be.an.instanceOf(Array);
            wsb.extensions.should.be.an.instanceOf(Object);
            wsb.url.protocol.should.equal('ws:');
            wsb.url.hostname.should.equal('localhost');
        });
        it('should overwrite url on options', function() {
            wsb = new WebSocketBase({ url: "ws://example.com:467/grinch" });
            wsb.url.href.should.equal('ws://example.com:467/grinch/');
        });
        it('should overwrite mask on options', function() {
            wsb = new WebSocketBase({ mask: true });
            wsb.mask.should.be.true;
        });
        it('should overwrite timeout on options', function() {
            wsb = new WebSocketBase({ timeout: 60000 });
            wsb.timeout.should.equal(60000);
        });
        it('should overwrite maxConnections on options', function() {
            wsb = new WebSocketBase({ maxConnections: 5 });
            wsb.maxConnections.should.equal(5);
        });
    });

});
