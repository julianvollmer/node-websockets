var util = require('util');
var stream = require('stream');

var eachFrame = require('./frames');

function MockupSocket() {
    this.readable = true;
    this.writable = true;
}

util.inherits(MockupSocket, stream.Stream);

MockupSocket.prototype.end = function() {
    console.log('connection determinated, socket closing');
};

MockupSocket.prototype.write = function(frame) {
    this.emit('data', frame);
};

MockupSocket.prototype.beginTest = function() {
    var self = this;
    
    eachFrame(function(name, fin, mask, opcode, length, masking, payload, content, frame) {
        self.write(frame);    
    });
};

module.exports = MockupSocket;