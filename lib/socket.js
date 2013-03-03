var util = require('util');
var events = require('events');
var stream = require('stream');

var inherits = util.inherits;

var Stream = stream.Stream;
var EventEmitter = events.EventEmitter;

var WebSocketFrame = require('./frame');

function WebSocketSocket(socket, options) {
    options = (options || {});

    if (!(socket instanceof Stream))
        throw new Error('socket has to be an instaneof stream class');

    // default options
    this.mask = false;
    this.readChain = [];
    this.writeChain = [];

    // overwrite defaults with possible options
    if (options.mask)
        this.mask = options.mask;

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

inherits(WebSocketSocket, EventEmitter);

WebSocketSocket.prototype.write = function(opcode, content) {
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

    var wsf = new WebSocketFrame();
    wsf.fin = true;
    wsf.mask = this.mask;
    wsf.opcode = opcode;
    wsf.length = content.length;
    wsf.content = content;

    execChain(this.writeChain.concat(done), wsf, this);
        
    function done(next, wsf) {
        var err = wsf.isValid();

        if (!err)
            this.socket.write(wsf.toBuffer());
        
        next(err);
    }
};

WebSocketSocket.prototype.assign = function(socket) {
    if (!socket instanceof Stream)
        throw new Error('socket must be an instance of stream.');

    var self = this;

    this.socket = socket;

    this.socket.on('data', function(data) {
        parseFrame(data, self);  
    });
    this.socket.on('end', function() {
        self.emit('close');
    });

    this.emit('open');
 
    return this;
};

WebSocketSocket.prototype.destroy = function() {
    this.socket.end();

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
                this.emit('text', wsf.content.toString());
                break;
            case 0x02:
                this.emit('binary', wsf.content);
                break;
            case 0x08:
                this.destroy();
                this.emit('close', wsf.content.toString());
                break;
            case 0x09:
                this.write(0x0a, wsf.content);
                break;
            case 0x0a:
                this.emit('pong', wsf.content);
                break;
            default:
                this.emit('error', 'Invalid frame opcode.');
                break;
        }
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
