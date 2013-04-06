var util = require('util');
var stream = require('stream');

util.inherits(MockupSocket, stream.Duplex);

function MockupSocket(options) {
    options = options || {};   

    stream.Duplex.call(this, options);
}

MockupSocket.prototype._read = function() {

};

MockupSocket.prototype._write = function(chunk, encoding, done) {
    this.emit('data', chunk);

    done(null);
};

MockupSocket.prototype.setTimeout = function() {};

module.exports = MockupSocket;
