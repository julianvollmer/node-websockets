var http = require('http');
var should = require('should');

var WebSocketServer = require('../../lib/server');
var WebSocketUpgrade = require('../../lib/upgrade');

describe('WebSocketServer', function() {

    var server;
    var ressource = 'ws://localhost:3000';

    it('should inherit methods from WebSocketBase', function() {
        var wss = new WebSocketServer();
        wss.should.have.property('on');
        wss.should.have.property('emit');
        wss.should.have.property('send');
        wss.should.have.property('ping');
        wss.should.have.property('close');
        wss.should.have.property('assignSocket');
    });

    describe('#constructor()', function() {
        it('should use parse the url if provided', function() {
            var wss = new WebSocketServer({ url: ressource });
            wss.should.have.property('url');
            wss.url.should.be.a('object');
            wss.url.should.have.property('protocol', 'ws:');
            wss.url.should.have.property('hostname', 'localhost');
            wss.url.should.have.property('href', ressource + '/');
            wss.url.should.have.property('host', 'localhost:3000');
            wss.url.should.have.property('port', '3000');
        });
    });

});
