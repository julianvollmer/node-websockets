var net = require('net');
var should = require('should');

var MockupSocket = require('../mockup/socket');
var WebSocketFrame = require('../../lib/frame');
var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {

    var sck, wss;

    beforeEach(function() {
        sck = new MockupSocket();
        wss = new WebSocketSocket(sck);
    });

    describe('#destroy()', function() {

        it('should close the socket connection');

        it('should block all write actions after connection was closed');
    
    });

});
