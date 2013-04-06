var util = require('util');
var stream = require('stream');

var WebSocketStream = require('./stream');

var emptyBuffer = new Buffer(0);

function WebSocket(source, options) {
    options = options || {};
    
    this.first = true;
    this.ended = false;

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
    var wsstream = new WebSocketStream(source, options);

    wssocket._wsstream = wsstream;

    wssocket._wsstream.on('head', function(state) {
        switch (state.opcode) {
            case 0x01:
                if (state.stream) {
                    handleStream(wsstream, wssocket)
                } else {
                    handleMessageFrame(wsstream, wssocket);
                }
                break;

            case 0x02:
                handleStream(wsstream, wssocket);
                break;

            case 0x08:
                handleCloseFrame(wsstream, wssocket);
                break;

            case 0x09:
                handlePingFrame(wsstream, wssocket);
                break;

            case 0x0a:
                handlePongFrame(wsstream, wssocket);
                break;
        }
    });

    wssocket._wsstream.on('readable', function() {
        wssocket.read(0); 
    });

    wssocket._wsstream.on('end', function() {
        wssocket.emit('close');
    });
}

function handleStream(wsstream, wssocket) {
    wssocket.emit('stream:start');

    // TODO: this is emitted to quick
    // we should listen do something else...
    wsstream.once('done', function() {
        wsstream.unpipe(wssocket);
        // send final frame
        wssocket.write(emptyBuffer);
        wssocket.emit('stream:end');
    });

    wsstream.pipe(wssocket);
};

function handlePingFrame(wsstream, wssocket) {
    wsstream.once('done', function() {
        var payload = wssocket.read();
        
        wsstream.writeHead({ fin: true, opcode: 0x0a });
        wsstream.write(payload || emptyBuffer);
    });
}

function handlePongFrame(wsstream, wssocket) {
    wsstream.once('done', function() {
        var payload = wssocket.read();

        wssocket.emit('pong', payload || emptyBuffer);
    });
}

function handleCloseFrame(wsstream, wssocket) {
    wsstream.once('done', function() {
        var payload = wssocket.read();

        wsstream.push(null);
        wsstream.end();

        wssocket.emit('close', payload || emptyBuffer);
    });
}

function handleMessageFrame(wsstream, wssocket) {
    wsstream.once('done', function() {
        var payload = wssocket.read() || emptyBuffer;
        
        wssocket.emit('message', payload.toString());
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
