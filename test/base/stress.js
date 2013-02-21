var util = require('util');
var should = require('should');

var mockupFrames = require('../mockup/frames');
var MockupSocket = require('../mockup/socket');
var WebSocketBase = require('../../lib/base');

var format = util.format;

describe('WebSocketBase', function() {

    mockupFrames.each(function(name, container) {
        it(format('should handle %s frame properly', name), function(done) {
            var wsb = new WebSocketBase();
            var socket = new MockupSocket();
            wsb.masked = container.mask;
            wsb.assignSocket(socket);
            switch (container.opcode) {
                case 0x01:
                    wsb.once('message', function(mess) {
                        mess.should.be.a('string');
                        mess.should.equal(container.content.toString());
                        done();
                    });
                    socket.write(container.frame);
                    break;
                case 0x08:
                    wsb.once('close', function(reason) {
                       done(); 
                    });
                    socket.write(container.frame);
                    break;
                case 0x09:
                    wsb.once('pong', function(mess) {
                        done(); 
                    });
                    socket.write(container.frame);
                    break;
                default:
                    socket.write(container.frame);
                    done();
                    break;
            }
        });
    });

});

