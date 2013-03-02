var util = require('util');
var events = require('events');
var stream = require('stream');

var WebSocketFrame = require('./frame');

var inherits = util.inherits;
var Stream = stream.Stream;
var EventEmitter = events.EventEmitter;

function WebSocketSocket(socket, options) {
    if (!(socket instanceof Stream))
        throw new Error('socket has to be an instaneof stream class');

    // default options
    this.mask = false;
    this.readChain = [];
    this.writeChain = [];

    // overwrite defaults with possible options
    if (options && options.mask)
        this.mask = options.mask;

    if (options && options.extensions) {
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

WebSocketSocket.prototype.send = function(message) {
    this.write(0x01, new Buffer(message));

    return this;
};

WebSocketSocket.prototype.write = function(opcode, content) {
    var self = this;
    
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

    execChain(this.writeChain.concat(done), wsf);
        
    function done(next, wsf) {
        if (wsf.isValid()) {
            self.socket.write(wsf.toBuffer());
        } else {
            next('Invalid frame');
        }
    }
};

WebSocketSocket.prototype.close = function(reason) {
    if (arguments.length == 0)
        reason = '';
    if (typeof reason != 'string')
        throw new Error('reason needs to be a string');

    // TODO: 
    // we have to differntiate between closing when a close frame comes
    // and when we want to sent a clsoe frame
    this.write(0x08, new Buffer(reason));
    this.emit('close', reason);
    this.socket.end();
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

function parseFrame(data, context) {
    var wsf = new WebSocketFrame(data);
    
    if (!wsf.isValid()) {
        context.emit('error', 'Invalid frame.');
        
        return;
    }
    
    execChain([done].concat(this.readChain), wsf);

    function done(next, wsf) {
        switch (wsf.opcode) {
            case 0x00:
                // set a flag that we are in continuation mode
                // save the first frame we found in the context
                // add so much frame fragments until we have a 0x1 or 0x2
                break;
            case 0x01:
                context.emit('text', wsf.content.toString());
                break;
            case 0x02:
                context.emit('binary', wsf.content);
                break;
            case 0x08:
                context.socket.end();
                context.emit('close', wsf.content.toString());
                break;
            case 0x09:
                context.write(0x0a, wsf.content);
                context.emit('ping', wsf.content);
                break;
            case 0x0a:
                context.emit('pong', wsf.content);
                break;
            default:
                context.emit('error', 'Invalid frame opcode.');
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
