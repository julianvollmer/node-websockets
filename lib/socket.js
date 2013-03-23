var util = require('util');
var events = require('events');
var stream = require('stream');

var WebSocketFrame = require('./frame');

function WebSocketSocket(socket, options) {
    options = (options || {});

    if (!(socket instanceof stream.Stream))
        throw new Error('socket has to be an instaneof stream class');

    // default options
    this.mask = false;
    this.readChain = [];
    this.writeChain = [];

    // overwrite defaults with possible options
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

    this.assign(socket);
}

util.inherits(WebSocketSocket, events.EventEmitter);

WebSocketSocket.prototype.send = function(body) {
    var opcode = 0x02;
    
    if (typeof body == 'string') {
        body = new Buffer(body);
        opcode = 0x01;
    }

    this._write(opcode, body);

    return this;
};

WebSocketSocket.prototype.ping = function(body) {
    if (typeof body == 'string') {
        body = new Buffer(body);
    } else {
        body = new Buffer(0);
    }

    this._write(0x09, body);

    return this;
};

WebSocketSocket.prototype.close = function(reason) {
    if (typeof reason == 'string') {
        reason = new Buffer(reason);
    } else {
        reason = new Buffer(0);
    }
    
    this._write(0x08, reason);

    return this;
};

WebSocketSocket.prototype._write = function(opcode, content) {
    if (opcode instanceof Buffer) {
        content = opcode;
        opcode = 0x01;
    }

    if (!content)
        content = new Buffer(0);

    if (typeof opcode != 'number')
        throw new Error('opcode should be a number');
    if (!(content instanceof Buffer))
        throw new Error('content should be a buffer');

    var wsframe = new WebSocketFrame();
    wsframe.fin = true;
    wsframe.mask = this.mask;
    wsframe.opcode = opcode;
    wsframe.length = content.length;
    wsframe.content = content;

    execChain(this.writeChain.concat(done), wsframe, this);
        
    function done(next, wsframe) {
        var err = wsframe.isValid();

        if (!err)
            this._socket.write(wsframe.toBuffer());
        
        next(err);
    }
};

WebSocketSocket.prototype.assign = function(socket) {
    if (!socket instanceof stream.Stream)
        throw new Error('socket must be an instance of stream.');

    var self = this;

    this._socket = socket;

    this._socket.on('data', function(data) {
        parseFrame(data, self);  
    });
    this._socket.on('end', function() {
        self.emit('close');
    });

    this.emit('open');
 
    return this;
};

function parseFrame(data, context) {
    var wsf = new WebSocketFrame(data);

    var err = wsf.isValid();
    
    if (err)
        return context.emit('error', err);
    
    execChain(context.readChain.concat(done), wsf, context);

    function done(next, wsf) {
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
                this._socket.end();
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

        if (wsf.glued)
            parseFrame(wsf.remnant, this);
    }
     
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

module.exports = WebSocketSocket;
