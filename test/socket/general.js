var net = require('net');
var util = require('util');
var events = require('events');

var MockupSocket = require('../mockup/socket');
var mockupFrames = require('../mockup/frames');
var mockupExtensions = require('../mockup/extensions');

var WebSocketSocket = require('../../lib/socket');

describe('WebSocketSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocketSocket(msocket, { extensions: mockupExtensions });
    });

    it('should inherit from EventEmitter', function() {
        wssocket.should.be.an.instanceOf(events.EventEmitter);
        wssocket.on.should.be.a('function');
        wssocket.emit.should.be.a('function');
    });

    describe('#constructor(socket[, options])', function() {

        it('should throw an error if argument is not a socket instance', function() {
            (function() {
                new WebSocketSocket('string');    
            }).should.throwError();
        });

        it('should store socket in property', function() {
            wssocket.should.have.property('_socket', msocket);
        });

        it('should create a read and write chain if extensions set in options', function() {
            wssocket.should.have.property('readChain');
            wssocket.should.have.property('writeChain');
            wssocket.readChain.should.include(mockupExtensions['x-concat-bubu'].read);
            wssocket.readChain.should.include(mockupExtensions['x-concat-taja'].read);
            wssocket.writeChain.should.include(mockupExtensions['x-concat-bubu'].write);
            wssocket.writeChain.should.include(mockupExtensions['x-concat-taja'].write);
        });

    });

    describe('#assign(socket)', function() {
   
        it('should throw an error if argument is not a socket instance', function() {
            (function() {
                wssocket.assign('string');    
            }).should.throwError();
        });

        it('should store socket in property', function() {
            wssocket.assign(msocket);
            wssocket.should.have.property('_socket', msocket);
        });

    });

});
