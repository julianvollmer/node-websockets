var http = require('http');
var should = require('should');

var WebSocketServer = require('../../lib/server');
var WebSocketUpgrade = require('../../lib/upgrade');

describe('WebSocketServer', function() {

    var server;
    var ressource = 'ws://localhost:3000';
    var extenOne = { enabled: true, name: "x-test-one", read: one, write: parser };
    var extenTwo = { enabled: true, name: "x-test-two", read: two, write: parser };

    function one(next, frame) {
        frame.content = new Buffer(frame.content.toString() + ' one');
        
        next(null, frame);
    }

    function two(next, frame) {
        frame.content = new Buffer(frame.content.toString() + ' two');

        next(null, frame);
    }

    function parser(next, frame) {
        next(null, frame);
    }

    beforeEach(function() {
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
        it('should listen on the defined url for upgrade requests (one extension)', function(done) {
            var wss = new WebSocketServer({ url: ressource });
            wss.once('message', function(message) {
                message.should.be.equal('Hello one');
                done();
            });
            wss.listen(server);
            wss.addExtension(extenOne.name, extenOne.read, extenOne.write);
            WebSocketUpgrade.createUpgradeRequest(ressource, { extensions: [extenOne] }, function(res, socket) {
                socket.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
            });
        });
        it('should listen on the defined url for upgrade requests (two extensions)', function(done) {
            var wss = new WebSocketServer({ url: ressource });
            wss.once('message', function(message) {
                message.should.be.equal('Hello one two');
                done();
            });
            wss.listen(server);
            wss.addExtension(extenOne.name, extenOne.read, extenOne.write);
            wss.addExtension(extenTwo.name, extenTwo.read, extenTwo.write);
            WebSocketUpgrade.createUpgradeRequest(ressource, { extensions: [extenOne, extenTwo] }, function(res, socket) {
                socket.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]));
            });
        });
    });

});

