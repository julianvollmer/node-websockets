var util = require('util');
var stream = require('stream');

var WebSocketCore = require('./core');
var WebSocketOutgoing = require('./outgoing');

var emptyBuffer = new Buffer(0);

function WebSocket(source, options) {
    options = options || {};
    
    this.first = true;

    this.opcode = 0x02;

    if (options.opcode)
        this.opcode = options.opcode;

    bindToSource(this, source, options);

    stream.Duplex.call(this, options);
}

util.inherits(WebSocket, stream.Duplex);

WebSocket.prototype.send = function(message) {
    var outgoing = new WebSocketOutgoing(this._wscore, this);
    var message = transformMessage(message);

    outgoing.fin = true;
    outgoing.opcode = 0x01;
    outgoing.length = message.length;

    outgoing.write(message);
    outgoing.end();

    return this;
};

WebSocket.prototype.ping = function(message) {
    var outgoing = new WebSocketOutgoing(this._wscore, this);
    var message = transformMessage(message);

    outgoing.fin = true;
    outgoing.opcode = 0x09;
    outgoing.length = message.length;

    outgoing.write(message);
    outgoing.end();

    return this;
};

WebSocket.prototype.close = function(message) {
    var outgoing = new WebSocketOutgoing(this._wscore, this);
    var message = transformMessage(message);

    outgoing.fin = true;

    outgoing.opcode = 0x08;
    outgoing.length = message.length;

    outgoing.write(message);
    outgoing.end();

    return this;
};

WebSocket.prototype._read = function() {
    /*
    var chunk = this.request.read();

    if (chunk === null)
        return this.push('');

    return this.push(chunk);
    */
};

WebSocket.prototype._write = function(chunk, encoding, done) {
    var outgoing = new WebSocketOutgoing(this._wscore, this);

    outgoing.fin = !chunk.length;
    outgoing.opcode = (this.first) ? this.opcode : 0x00;
    outgoing.length = chunk.length;

    outgoing.write(chunk);
    outgoing.end();

    if (this.first)
        this.first = false;

    if (!chunk.length)
        this.first = true;
    
    done(null);
};

module.exports = WebSocket;

function bindToSource(wssocket, source, options) {
    options.useRequest = true;

    var wscore = new WebSocketCore(source, options);

    wssocket._wscore = wscore;

    wssocket._wscore.on('request', function(request) {
        var err = validateRequest(request);

        if (err) wssocket.close(1002);

        if (request.extendedLength > 0)
            wssocket.close(1009);

        if (!request.fin && request.opcode)
            wssocket._opcode = request.opcode;

        var opcode = request.opcode;

        if (!request.opcode)
            opcode = wssocket._opcode;

        switch (opcode) {
            case 0x01:
                if (request.stream)
                    handleStream(wssocket, request)
                else
                    handleMessageFrame(wssocket, request);
                break;

            case 0x02:
                handleStream(wssocket, request);
                break;

            case 0x08:
                handleCloseFrame(wssocket, request, wscore);
                break;

            case 0x09:
                handlePingFrame(wssocket, request, wscore);
                break;

            case 0x0a:
                handlePongFrame(wssocket, request);
                break;
        }
    });

    wssocket._wscore.on('end', function() {
        wssocket.emit('close');
    });
}

function handleStream(wssocket, request) {
    request.on('readable', function() {
        var chunk = request.read();

        wssocket.push(chunk);
    });
    request.once('end', function() {
        wssocket.emit('stream:end');
    });

    wssocket.emit('stream:start');
};

function handlePingFrame(wssocket, request, wscore) {
    var outgoing = new WebSocketOutgoing(wscore, wssocket);
    
    outgoing.fin = true;
    outgoing.opcode = 0x0a;
    
    var chunk = [];
    request.on('readable', function() {
        chunk.push(request.read());
    });
    request.on('end', function() {
        var message = Buffer.concat(chunk);

        outgoing.length = message.length;

        outgoing.write(message);
        outgoing.end();
    });
}

function handlePongFrame(wssocket, request) {
    var cache = [];

    request.on('readable', function() {
        var chunk = request.read()
     
        if (chunk) cache.push(chunk);
    });
    request.once('end', function() {
        var payload = Buffer.concat(cache);

        wssocket.emit('pong', payload);
    });
}

function handleCloseFrame(wssocket, request, wscore) {
    var chunks = [];

    request.on('readable', function() {
        var chunk = request.read();

        if (chunk) chunks.push(chunk);
    });
    request.once('end', function() {
        var payload = Buffer.concat(chunks);
            
        wscore.push(null);
        wscore.end();

        wssocket.emit('close', payload);
    });
}

function handleMessageFrame(wssocket, request) {
    var chunks = [];

    request.on('readable', function() {
        var chunk = request.read();

        if (chunk) chunks.push(chunk);
    });
    request.once('end', function() {
        var payload = Buffer.concat(chunks);

        wssocket.emit('message', payload.toString());
    });
}

function validateRequest(request) {
    if (request.rsv1 || request.rsv2 || request.rsv3)
        return new Error('Frame has set reserved bit');
    if (request.opcode > 0x0a ||
       (request.opcode > 0x02 && request.opcode < 0x08))
        return new Error('Frame has invalid opcode');

    return null;
}

function transformMessage(message) {
    var chunk = emptyBuffer;

    if (typeof message == 'string') {
        chunk = new Buffer(message);
    }
    if (typeof message == 'number') {
        if (message > 0x00 && message < 0x100) {
            chunk = new Buffer(1);
            chunk.writeUInt8BE(message, 0);
        }
        if (message > 0xff && message < 0x10000) {
            chunk = new Buffer(2);
            chunk.writeUInt16BE(message, 0);
        }
        if (message > 0xffff && message < 0x100000000) {
            chunk = new Buffer(2);
            chunk.writeUInt32BE(message, 0);
        }
    }
    if (Buffer.isBuffer(message))
        chunk = message;

    return chunk;
}
