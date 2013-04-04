var util = require('util');
var stream = require('stream');

util.inherits(MockupSocket, stream.Duplex);

function MockupSocket(options) {
       
    stream.Duplex.call(this, options);
}

MockupSocket.prototype._read = function() {
        
};

MockupSocket.prototype._write = function(chunk, encoding, done) {
    this.push(chunk);

    done(null);
};

module.exports = MockupSocket;
