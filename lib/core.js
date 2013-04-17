var util = require('util');
var stream = require('stream');
var crypto = require('crypto');
var parser = require('./parser');

var WebSocketIncoming = require('./incoming');
var WebSocketOutgoing = require('./outgoing');

util.inherits(WebSocketCore, stream.Duplex);

var emptyBuffer = new Buffer(0);

function WebSocketCore(source, options) {
    options = options || { opcode: 0x01 };

    this.options = options;
        
    this._incomingId = 0;
    this._outgoingId = 0;

    this._incoming = null;
    this._outgoing = null;
    
    createOutgoing(this);

    bindToSource(this, source, options);

    stream.Duplex.call(this, options);
}

WebSocketCore.prototype._read = function() {
    var chunk = this._source.read();
    var incoming = this._incoming;
    
    if (chunk === null)
        return this.push('');

    if (!incoming || !incoming._body)
        parseHead(this, incoming, chunk);
    else
        parseBody(this, incoming, chunk);
};

WebSocketCore.prototype._write = function(chunk, encoding, done) {
    var source = this._source;
    var outgoing = this._outgoing;

    if (!outgoing._wroteHead)
        source.write(parser.writeHeadBytes(outgoing));

    outgoing._wroteHead = true;

    if (outgoing.written + chunk.length > outgoing.length)
        done(new Error('Payload exceeds defined length in head.'));

    // NOTE: doing write async can break frame order
    source.write(parser.writeBodyBytes(outgoing, chunk));

    outgoing._writtenBytes += chunk.length;
    
    // TODO: this is open for errors in some cases because we copy all chunk
    // even this can be more than allowed
    if (outgoing._writtenBytes == outgoing.length)
        createOutgoing(this);

    done(null);
};

module.exports = WebSocketCore;

function createIncoming(stream) {
    stream._incoming = new WebSocketIncoming(stream);

    stream._incoming._id = stream._incomingId++;

    return stream._incoming;
}

function createOutgoing(stream) {
    stream._outgoing = new WebSocketOutgoing(stream, stream.options);

    stream._outgoing._id = stream._outgoingId++;
    
    return stream._outgoing;
}

function parseHead(stream, incoming, chunk) {
    var incoming = createIncoming(stream);

    var headSize = incoming._headSize;
    var headBytes = incoming._headBytes;

    // copy chunk bytes to the end of our head byte cache
    // NOTE: we use an array to be more flexible
    var s = headBytes.length;
    for (var i = 0; i < chunk.length; i++)
        headBytes[s + i] = chunk[i];

    // map our array from above to a buffer
    var headBuffer = new Buffer(headBytes);

    console.log('incoming #' + incoming._id, headBuffer.slice(0, 2));

    // calc headSize if not done and we have enough head bytes
    if (!headSize && headBuffer.length > 1)
        headSize = incoming._headSize = parser.calcHeadSize(headBuffer);
    
    // if headSize was calced and we have equal or more head bytes
    // we can parse the head completly and go on
    if (headSize && headBuffer.length >= headSize) {
        parser.readHeadBytes(incoming, headBuffer);
        // emit a head event if we have a real frame
        emitRequest(stream, incoming);

        // if our chunk is bigger than the headSize it is
        // properly some body chunk so we call parseBody on it
        if (headBuffer.length >= headSize) {
            incoming._body = true;
            parseBody(stream, incoming, chunk.slice(headSize));
        }
    }

    // push empty string to 
    // keep on reading
    stream.push('');
}

function parseBody(stream, incoming, chunk) {
    var body = parser.readBodyBytes(incoming, chunk);
    var remnant = chunk.slice(incoming.length);

    console.log('incoming pushing body #'+incoming._id, body);

    stream.push(body);

    // if our index counter equals the length we have 
    // parsed all body bytes and maybe have new frame
    if (incoming.length == incoming._index) {
        stream._incoming = null;
        if (remnant.length) 
            parseHead(stream, incoming, remnant);
    }
}

function emitRequest(stream, incoming) {
    // stream can either be a some fragmented frames
    // or a frame above the highWaterMark which is chunked
    incoming.stream = !incoming.fin || incoming.length > 500;

    stream.emit('request', incoming);
}

function bindToSource(stream, source) {
    stream._source = source;
    stream._source.on('readable', function() {
        stream.read(0);
    });
    // TODO: we should call end() and push(null)
    // on stream but this will fuck up end events...
    stream._source.on('end', function() {
        stream.emit('end');
    });
}
