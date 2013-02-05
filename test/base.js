var assert = require('assert');

var WebSocketBase = require('../lib/base');

var MockupSocket = require('./mockup/socket');

describe('WebSocketBase', function() {
    
    describe('#send()', function() {
        
    });
    
    describe('#pong()', function() {
        
    });
    
    describe('#close()', function() {
        
    });
    
    describe('event: "open"', function() {
        
    });
    
    describe('event: "pong"', function() {
        
    });
    
    describe('event: "close"', function() {
        
    });
    
    describe('event: "message"', function() {
        
    });
    
    describe('event: "error"', function() {
        
    });

});

function testEvents() {
    var wsb = new WebSocketBase();
    var socket = new MockupSocket();
    
    wsb.on('open', function() {
       console.log('open event works'); 
    });
    
    wsb.on('pong', function() {
        console.log('pong event works');
    });
    
    wsb.on('close', function() {
        console.log('close event works');
    });
    
    wsb.on('message', function(mess) {
        console.log('message event works', mess);
    });
    
    wsb.assignSocket(socket);
    
    setTimeout(function() {
        socket.beginTest();
    }, 500);
}

function testMethods() {
    var wsb = new WebSocketBase();
    var socket = new MockupSocket();
    
    wsb.on('pong', function(mess) {
        console.log(mess.toString());
        
        wsb.close('I have enough friends.'); 
    });
    
    wsb.on('message', function(mess) {
        console.log(mess); 
    });
    
    wsb.assignSocket(socket);
    
    setTimeout(function() {
        wsb.send('Hello my friend!'); 
    }, 100);
    setTimeout(function() {
        wsb.send('How are you my friend?'); 
    }, 1000);
    setTimeout(function() {
        wsb.send('What is your wife doing?');
    }, 4000);
    setTimeout(function() {
        wsb.ping('You are not that communicative!');
    }, 8000);
}

testEvents();
testMethods();