var util = require('util');
var stream = require('stream');

var WebSocketFrame = require('./frame');

function WebSocketStream(options) {
    stream.Transform.call(this, options);

    this.cache = null;
    this.caching = false;
}

util.inherits(WebSocketStream, stream.Transform);

WebSocketStream.prototype._transform = function(chunk, encoding, done) {
    // if we are package was incomplete concat the chunk with cache 
    if (this.caching) {
        chunk = Buffer.concat([this.cache, chunk]);
        this.cache = null;
        this.caching = false;
    }
    
    // detect if frame is incomplete, set flags and return
    if (isSplittedFrame(chunk)) {
        this.cache = chunk;
        this.caching = true;

        return done();
    }

    while (chunk) {
        this.push(frameOnly(chunk));
        chunk = remnantOnly(chunk);
    }

    done();
};

// returns true if header length is higher
// than the actual payload length
function isSplittedFrame(chunk) {
    var wsframe = new WebSocketFrame(chunk);
    
    return wsframe.length > wsframe.payload.length;
}

// return true if header length is lower
// than the actual frame length
function isGluedFrame(chunk) {
    var wsframe = new WebSocketFrame(chunk);

    return wsframe.glued;
}

// returns the frame itself without glued packages
function frameOnly(chunk) {
    var wsframe = new WebSocketFrame(chunk);

    return wsframe.frame;
}

// returns the remnant part of the glued frames
function remnantOnly(chunk) {
    var wsframe = new WebSocketFrame(chunk);

    return wsframe.remnant;
}

module.exports = WebSocketStream;
