var stream = require('stream');
var events = require('events');

var WebSocketBase = require('../lib/base');
var WebSocketFrame = require('../lib/frame');

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
    
    var socket = new events.EventEmitter();
    socket.close = function() {};
    socket.write = function() {};
    
    wsb._assignSocket(socket);
    
    var messFrame = new WebSocketFrame();
    messFrame.setFinal(true);
    messFrame.setMasked(true);
    messFrame.setOpcode(0x1);
    messFrame.setPayload(new Buffer('hello world'));
        
    var pongFrame = new WebSocketFrame();
    pongFrame.setFinal(true);
    pongFrame.setMasked(false);
    pongFrame.setOpcode(0xA);
        
    var closeFrame = new WebSocketFrame();
    closeFrame.setFinal(true);
    closeFrame.setMasked(false);
    closeFrame.setOpcode(0x8);
    closeFrame.setPayload(new Buffer('just a test'));
    
    setTimeout(function() {
        socket.emit('data', messFrame.toBuffer()); 
    }, 400);
    setTimeout(function() {
        socket.emit('data', pongFrame.toBuffer()); 
    }, 800);
    setTimeout(function() {
        socket.emit('data', closeFrame.toBuffer()); 
    }, 1200);
    
    return true;
}

console.log('event test:', testEvents());