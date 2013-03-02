var util = require('util');
var should = require('should');

var MockupSocket = require('../mockup/socket');
var WebSocketBase = require('../../lib/base');
var WebSocketFrame = require('../../lib/frame');

var format = util.format;

describe('WebSocketBase', function() {
    
    var wsb;
    var socket;

    beforeEach(function() {
        wsb = new WebSocketBase({ mask: true });
        socket = new MockupSocket();

        wsb.assignSocket(socket);
    });

    describe('#send()', function() {
        it(format('should send a text frame containing "%s"', 'Hello World.'), function(done) {
            socket.once('data', function(chunk) {
                var frame = new WebSocketFrame(chunk);
                frame.fin.should.be.true;
                //frame.mask.should.be.true;
                frame.opcode.should.equal(0x01);
                frame.length.should.equal(0x0c);
                frame.content.toString().should.equal('Hello World.');
                done(); 
            });
            wsb.send('Hello World.');
        });
    });

});
