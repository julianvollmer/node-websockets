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

    this.socket.on('data', function(chunk) {
        parseChunk.call(self, chunk);
    });
    this.socket.on('end', function(err) {
        var reason;

        if (err) reason = 'error on socket object';

        self.emit('close', reason);
    });
}

util.inherits(WebSocket, events.EventEmitter);

WebSocket.prototype.send = function(message) {
    var opcode = 0x02;

    if (typeof message == 'string')
        opcode = 0x01;

    this._write(opcode, toBuffer(message));

    return this;
}

WebSocket.prototype.ping = function(message) {
    this._write(0x09, toBuffer(message));

    return this;
};

WebSocket.prototype.close = function(reason) {
    this._write(0x08, toBuffer(reason));

    return this;
};

WebSocket.prototype._write = function(opcode, content) {
    var wsframe = new WebSocketFrame();
    wsframe.fin = true;
    wsframe.mask = this.mask;
    wsframe.opcode = opcode;
    wsframe.length = content.length;
    wsframe.content = content;

    execChain(this.writeChain.concat(doneWrite), wsframe, this);
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

function parseChunk(chunk) {
    var wsf;

    if (this.cache) {
        wsf = this.cache;
        wsf.payload = Buffer.concat([wsf.payload, chunk]);
    } else {
        wsf = new WebSocketFrame(chunk);
    }

    if (wsf.length == wsf.payload.length) {
        this.cache = null;
        execChain(this.readChain.concat(doneRead), wsf, this);
    } else {
        this.cache = wsf;
        
        return;
    }
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
            this._write(0x0a, wsf.content);
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
