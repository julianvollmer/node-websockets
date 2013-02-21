var util = require('util');
var should = require('should');

var WebSocketBase = require('../../lib/base');

describe('WebSocketBase', function() {
 
    var wsb;

    beforeEach(function() {
        wsb = new WebSocketBase({ mask: true });
    });

    describe('#constructor()', function() {
        it('should set ws://localhost:3000 as default url', function() {
            wsb.url.should.be.a('object');
            wsb.url.should.have.property('slashes', true);
            wsb.url.should.have.property('protocol', 'ws:');
            wsb.url.should.have.property('hostname', 'localhost');
            wsb.url.should.have.property('href', 'ws://localhost:3000');
            wsb.url.should.have.property('host', 'localhost:3000');
            wsb.url.should.have.property('port', '3000');
            wsb.url.should.have.property('path', '/');
        });
        it('should use the url defined in options if provided', function() {
            var wsb = new WebSocketBase({ url: "ws://sockets.org:5000/index" });
            wsb.url.should.be.a('object');
            wsb.url.should.have.property('slashes', true);
            wsb.url.should.have.property('protocol', 'ws:');
            wsb.url.should.have.property('hostname', 'sockets.org');
            wsb.url.should.have.property('href', 'ws://sockets.org:5000/index');
            wsb.url.should.have.property('host', 'sockets.org:5000');
            wsb.url.should.have.property('path', '/index');
            wsb.url.should.have.property('port', '5000'); 
        });
    });

});
