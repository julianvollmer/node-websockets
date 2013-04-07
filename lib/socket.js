var util = require('util');
var stream = require('stream');

var WebSocketStream = require('./stream');
var WebSocketOutgoing = require('./outgoing');

var emptyBuffer = new Buffer(0);

function WebSocket(source, options) {
    options = options || {};
    
    this.first = true;

    bindToSource(this, source, options);

    stream.Duplex.call(this, options);
}

util.inherits(WebSocket, stream.Duplex);

WebSocket.prototype.send = function(message) {
    message = transformMessage(message);

    this._wsstream.writeHead({ fin: true, opcode: 0x01 });
    this._wsstream.write(message);

    return this;
};

WebSocket.prototype.ping = function(message) {
    message = transformMessage(message);

    this._wsstream.writeHead({ fin: true, opcode: 0x09 });
    this._wsstream.write(message);

    return this;
};

WebSocket.prototype.close = function(message) {
    message = transformMessage(message);

    this._wsstream.writeHead({ fin: true, opcode: 0x08 });
    this._wsstream.write(message);

    return this;
};

WebSocket.prototype._read = function() {
    var chunk = this._wsstream.read();

    if (chunk === null)
        return this.push('');

    return this.push(chunk);
};

WebSocket.prototype._write = function(chunk, encoding, done) {
    var fin = !chunk.length;
    var opcode = (this.first) ? 0x02 : 0x00;

    this._wsstream.writeHead({ fin: fin, opcode: opcode });
    this._wsstream.write(chunk);

    if (this.first)
        this.first = false;

    if (!chunk.length)
        this.first = true;
    
    done(null);
};

module.exports = WebSocket;

function bindToSource(wssocket, source, options) {
    options.useRequest = true;

    var wsstream = new WebSocketStream(source, options);

    wssocket._wsstream = wsstream;

    wssocket._wsstream.on('request', function(request) {
        switch (request.opcode) {
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
                handleCloseFrame(wssocket, request, wsstream);
                break;

            case 0x09:
                handlePingFrame(wssocket, request, wsstream);
                break;

            case 0x0a:
                handlePongFrame(wssocket, request);
                break;
        }
    });

    wssocket._wsstream.on('end', function() {
        wssocket.emit('close');
    });
}

function handleStream(wssocket, request) {
    request.once('end', function() {
        request.unpipe(wssocket);
        wssocket.write(emptyBuffer);
        wssocket.emit('stream:end');
    });

    wssocket.emit('stream:start');

    request.pipe(wssocket);
};

function handlePingFrame(wssocket, request, wsstream) {
    request.once('readable', function() {
        wsstream.writeHead({ fin: true, opcode: 0x0a });
        wsstream.write(request.read());
    });
    request.once('end', function() {
        wsstream.writeHead({ fin: true, opcode: 0x0a });
        wsstream.write(emptyBuffer);
    });
}

function handlePongFrame(wssocket, request) {
    request.once('readable', function() {
        var payload = request.read();

        wssocket.emit('pong', payload);
    });
    request.once('end', function() {
        wssocket.emit('pong', emptyBuffer);
    });
}

function handleCloseFrame(wssocket, request, wsstream) {
    request.once('readable', function() {
        var payload = request.read();

        wsstream.push(null);
        wsstream.end();

        wssocket.emit('close', payload);
    });
    request.once('end', function() {
        wsstream.push(null);
        wsstream.end();

        wssocket.emit('close', emptyBuffer);
    });
}

function handleMessageFrame(wssocket, request) {
    request.once('readable', function() {
        var payload = request.read();
        
        wssocket.emit('message', payload.toString());
    });
    request.once('end', function() {
        wssocket.emit('message', emptyBuffer);
    });
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
