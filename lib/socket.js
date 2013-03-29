var util = require('util');
var events = require('events');
var stream = require('stream');

var WebSocketFrame = require('./frame');

function WebSocket(socket, options) {
    options = (options || {});

    var self = this;
    this.mask = false;
    this.cache = null;
    this.frame = null;
    this.fraged = false;
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

    this.socket.on('timeout', function() {
        self.close('socket timeout exceeded');
    });
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
    wsframe.setContent(content);

    execChain(this.writeChain.concat(doneWrite), wsframe, this);
};

function parseChunk(chunk) {
    var wsframe;

    if (this.cache) {
        wsframe = this.cache;
        wsframe.concat(chunk);
    } else {
        wsframe = new WebSocketFrame(chunk);
    }

    if (wsframe.length == wsframe.payload.length) {
        this.cache = null;
        // the unmasked payload (content) was not concated
        // with unmask we unmask the payload again
        // this has to happen before executing the
        // event chain else extensions do not work
        // this is really shitty and needs a fix...
        execChain(this.readChain.concat(doneRead), wsframe, this);
    } else {
        this.cache = wsframe;
        
        return;
    }
}
 
// last read cb will emit the right event on opcode
function doneRead(next, wsframe) {
    if (!wsframe.isValid()) {
        this.emit('error', wsframe.validate());

        return;
    }

    // if this is the first fragmented frame cache it,
    // set frag cache flag to true and return
    if (!wsframe.fin && !this.fraged) {
        this.frame = wsframe;
        this.fraged = true;

        return;
    }

    var content = wsframe.getContent();
    switch (wsframe.opcode) {
        case 0x00:
            // add the unmasked content of fragmented frames to content we already have
            this.frame.addFragment(wsframe);
            // if this is also the final frame reset flags and frame
            // and reexecute doneRead so the frame get handled correctly
            // with its origin opcode
            if (wsframe.fin) {
                wsframe = this.frame;
                wsframe.fin = true;
                this.frame = null;
                this.fraged = false;
                doneRead.call(this, next, wsframe);
            }
            break;
        case 0x01:
            this.emit('message', content.toString());
            break;
        case 0x02:
            this.emit('message', content);
            break;
        case 0x08:
            this.socket.end();
            this.emit('close', content.toString());
            break;
        case 0x09:
            this._write(0x0a, content);
            break;
        case 0x0a:
            this.emit('pong', content);
            break;
    }
}

// finally writes the frame to socket if valid
function doneWrite(next, wsframe) {
    var err = wsframe.validate();

    if (!err)
        this.socket.write(wsframe.toBuffer());
    
    next(err);
}

// helper which returns a buffer object
// on string, buffer or nothing
function toBuffer(obj) {
    var buf;
    
    if (Buffer.isBuffer(obj)) {
        buf = obj;
    } else if ('string' == typeof obj) {
        buf = new Buffer(obj);
    } else {
        buf = new Buffer(0);
    }

    return buf;
}

function execChain(chain, content, context) {
    var index = -1;

    function next(err, result) {
        if (err) 
            context.emit('error', err);
        
        index++;
        
        if (index < chain.length)
            chain[index].call(context, next, result);
    }

    next(null, content);
}

module.exports = WebSocket;
