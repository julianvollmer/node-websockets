var http = require('http');

var WebSocketServer = require('../../lib/server');
var WebSocketUpgrade = require('../../lib/upgrade');

describe('WebSocketServer', function() {

    var wsserver, ressource 
    
    beforeEach(function() {
        ressource = 'ws://localhost:3000';
    });

    it('should inherit methods from WebSocketBase', function() {
        wsserver = new WebSocketServer();
        wsserver.should.have.property('on');
        wsserver.should.have.property('emit');
        wsserver.should.have.property('assignSocket');
    });

    describe('#constructor()', function() {
        it('should use parse the url if provided', function() {
            wsserver = new WebSocketServer({ url: ressource });
            wsserver.should.have.property('url');
            wsserver.url.should.be.a('object');
            wsserver.url.should.have.property('protocol', 'ws:');
            wsserver.url.should.have.property('hostname', 'localhost');
            wsserver.url.should.have.property('href', ressource);
            wsserver.url.should.have.property('host', 'localhost:3000');
            wsserver.url.should.have.property('port', '3000');
        });
    });

});
