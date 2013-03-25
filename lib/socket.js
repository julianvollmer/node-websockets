var util = require('util');
var events = require('events');
var stream = require('stream');

var WebSocketFrame = require('./frame');

function WebSocket(socket, options) {
    options = (options || {});

    var self = this;
    this.mask = false;
    this.cache = null;
    this.caching = false;
    this.socket = socket;
    this.readChain = [];
    this.writeChain = [];

    if (options.mask)
        this.mask = options.mask;
    if (options.timeout)
        socket.setTimeout(options.timeout);
    if (options.extensions) {
        for (var key in options.extensions) {
            var extension = options.extensions[key];
            if (typeof extension.read == 'function')
                this.readChain.push(extension.read);
            if (typeof extension.write == 'function')
                this.writeChain.push(extension.write);
        }
    }

    stream.Transform.call(this, options);

    this.socket.pipe(this);
    this.socket.on('end', function(err) {
        var reason;

        if (err) reason = 'socket error';

        this.emit('close', reason);
    });
}

util.inherits(WebSocket, stream.Transform);

WebSocket.prototype.send = function(message) {
    var opcode = 0x02;

    if (typeof message == 'string') {
        message = new Buffer(message);
        opcode = 0x01;
    }

    this._writeFrame(opcode, message);

    return this;
};

WebSocket.prototype.ping = function(message) {
    this._writeFrame(0x09, toBuffer(message));

    return this;
};

WebSocket.prototype.close = function(reason) {
    this._writeFrame(0x08, toBuffer(reason));

    return this;
};

WebSocket.prototype._writeFrame = function(opcode, content) {
    var wsframe = new WebSocketFrame();
    wsframe.fin = true;
    wsframe.mask = this.mask;
    wsframe.opcode = opcode;
    wsframe.length = content.length;
    wsframe.content = content;

    execChain(this.writeChain.concat(doneWrite), wsframe, this);
};

WebSocket.prototype._transform = function(chunk, encoding, done) {
    var wsframe = new WebSocketFrame(chunk);
    
    // if we are package was incomplete concat the chunk with cache 
    if (this.caching) {
        chunk = Buffer.concat([this.cache, chunk]);
        this.cache = null;
        this.caching = false;
    }

    // detect if frame is incomplete, set flags and return
    if (wsframe.length > wsframe.payload.length) {
        this.cache = chunk;
        this.caching = true;

        return done();
    }

    while (chunk) {
        wsframe.mapFrame(chunk);
        this.push(wsframe.frame);
        var wsf = new WebSocketFrame(wsframe.frame);
        execChain(this.readChain.concat(doneRead), wsf, this);
        chunk = wsframe.remnant;
    }

    done();
};

function toBuffer(obj) {
    var buf;
    
    if (obj === undefined) {
        buf = new Buffer(0);
    } else if (typeof obj == 'string') {
        buf = new Buffer(obj);
    } else if (Buffer.isBuffer(obj)) {
        buf = obj;
    }

    return buf;
}

function execChain(chain, content, context) {
    var index = -1;

    function next(err, result) {
        if (err) 
            self.emit('error', err);
        
        index++;
        
        if (index < chain.length)
            chain[index].call(context, next, result);
    }

    next(null, content);

}

function doneRead(next, wsf) {
    var err = wsf.isValid();

    if (err) return this.emit('error', err);

    switch (wsf.opcode) {
        case 0x00:
            // set a flag that we are in continuation mode
            // save the first frame we found in the context
            // add so much frame fragments until we have a 0x1 or 0x2
            break;
        case 0x01:
            this.emit('message', wsf.content.toString());
            break;
        case 0x02:
            this.emit('message', wsf.content);
            break;
        case 0x08:
            this.socket.end();
            this.emit('close', wsf.content.toString());
            break;
        case 0x09:
            this._writeFrame(0x0a, wsf.content);
            break;
        case 0x0a:
            this.emit('pong', wsf.content);
            break;
        default:
            this.emit('error', 'Invalid frame opcode.');
            break;
    }
}
        
function doneWrite(next, wsframe) {
    var err = wsframe.isValid();

    if (!err)
        this.socket.write(wsframe.toBuffer());
    
    next(err);
}

module.exports = WebSocket;
