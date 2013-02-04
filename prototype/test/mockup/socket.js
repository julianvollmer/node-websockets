var util = require('util');
var stream = require('stream');

var frames = require('./frames');

function MockupSocket() {
    this.readable = true;
    this.writable = true;
}

util.inherits(MockupSocket, stream.Stream);

MockupSocket.prototype.write = function(frame) {
    this.emit('data', frame);
};

MockupSocket.prototype.beginTest = function() {
    this.testTextFrames();
    this.testPingFrames();
    this.testCloseFrames();
};

MockupSocket.prototype.testTextFrames = function() {
    var self = this;
    
    setTimeout(function() {
        console.log('socket is spitting text frames');
        
        self.write(frames.maskedTextFrame);
        self.write(frames.unmaskedTextFrame);
    }, 200);    
};

MockupSocket.prototype.testPingFrames = function() {
    var self = this;  
    
    setTimeout(function() {
        console.log('socket is spitting a ping frame');
        
        self.write(frames.unmaskedPingFrame);
    }, 400);
};

MockupSocket.prototype.testCloseFrames = function() {
    var self = this;
    
    setTimeout(function() {
        //self.write(frames.)
    }, 800);
};

module.exports = MockupSocket;