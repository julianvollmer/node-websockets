var WebSocketBase = require('../lib/base');

var socket = new (require('./mockup/socket'))();

function testEvents() {
    var wsb = new WebSocketBase();
    
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

testEvents();