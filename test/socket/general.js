var net = require('net');
var util = require('util');
var events = require('events');
var should = require('should');

var mockupFrames = require('../mockup/frames');
var WebSocketSocket = require('../../lib/socket');

var Socket = net.Socket;
var EventEmitter = events.EventEmitter;

describe('WebSocketSocket', function() {

    var sck, wss;

    beforeEach(function() {
        sck = new Socket();
        wss = new WebSocketSocket(sck);
    });

    it('should inherit from EventEmitter', function() {
        wss.should.be.an.instanceOf(EventEmitter);
        wss.on.should.be.a('function');
        wss.emit.should.be.a('function');
    });

    describe('#constructor(socket)', function() {

        it('should throw an error if argument is not a socket instance', function() {
            (function() {
                new WebSocketSocket('string');    
            }).should.throwError();
        });

        it('should store socket in property', function() {
            wss.should.have.property('socket', sck);
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
            wss.should.have.property('socket', sck);
        });

    });

});
