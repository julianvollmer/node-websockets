var net = require('net');
var util = require('util');
var events = require('events');
var should = require('should');

var mockupFrames = require('../mockup/frames');
var mockupExtensions = require('../mockup/extensions');

var WebSocketSocket = require('../../lib/socket');

var Socket = net.Socket;
var EventEmitter = events.EventEmitter;

describe('WebSocketSocket', function() {

    var sck, wss, opts;

    beforeEach(function() {
        sck = new Socket();
        wss = new WebSocketSocket(sck);
        opts = { extensions: mockupExtensions };
    });

    it('should inherit from EventEmitter', function() {
        wss.should.be.an.instanceOf(EventEmitter);
        wss.on.should.be.a('function');
        wss.emit.should.be.a('function');
    });

    describe('#constructor(socket[, options])', function() {

        it('should throw an error if argument is not a socket instance', function() {
            (function() {
                new WebSocketSocket('string');    
            }).should.throwError();
        });

        it('should store socket in property', function() {
            wss.should.have.property('_socket', sck);
        });

        it('should create a read and write chain if extensions set in options', function() {
            wss = new WebSocketSocket(sck, opts);
            wss.should.have.property('readChain');
            wss.should.have.property('writeChain');
            wss.readChain.should.include(mockupExtensions['x-concat-bubu'].read);
            wss.readChain.should.include(mockupExtensions['x-concat-taja'].read);
            wss.writeChain.should.include(mockupExtensions['x-concat-bubu'].write);
            wss.writeChain.should.include(mockupExtensions['x-concat-taja'].write);
        });

    });

    describe('#assign(socket)', function() {
   
        it('should throw an error if argument is not a socket instance', function() {
            (function() {
                wss.assign('string');    
            }).should.throwError();
        });

        it('should store socket in property', function() {
            wss.assign(sck);
            wss.should.have.property('_socket', sck);
        });

    });

});
