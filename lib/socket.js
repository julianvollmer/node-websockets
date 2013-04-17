var util = require('util');
var stream = require('stream');

var WebSocketCore = require('./core');
var WebSocketOutgoing = require('./outgoing');

var emptyBuffer = new Buffer(0);

var CLOSE_CODES = {
    "1000": "Normal Closure",
    "1001": "Going Away",
    "1002": "Protocol error",
    "1003": "Unsupported Data",
    "1005": "No Status Rcvd",
    "1006": "Abnormal Closure",
    "1007": "Invalid frame payload data",
    "1008": "Policy Violation",
    "1009": "Message Too Big",
    "1010": "Mandatory Ext.",
    "1011": "Internal Server Error",
    "1015": "TLS handshake"
};

function WebSocket(source, options) {
    options = options || {};
    
    this.first = true;

    this.opcode = 0x02;

    this._incomings = [];

    if (options.opcode)
        this.opcode = options.opcode;

    bindToSource(this, source, options);

    stream.Duplex.call(this, options);
}

util.inherits(WebSocket, stream.Duplex);

WebSocket.prototype.send = function(message) {
    var outgoing = this._wscore._outgoing;
    var message = normalize(message);

    outgoing.fin = true;
    outgoing.opcode = 0x01;
    outgoing.length = message.length;

    outgoing.write(message);
    outgoing.end();

    return this;
};

WebSocket.prototype.ping = function(message) {
    var outgoing = this._wscore._outgoing;
    var message = normalize(message);

    outgoing.fin = true;
    outgoing.opcode = 0x09;
    outgoing.length = message.length;

    outgoing.write(message);
    outgoing.end();

    return this;
};

WebSocket.prototype.close = function(message) {
    var outgoing = this._wscore._outgoing;
    var message = normalize(message);

    if (!message.length) {
        message = new Buffer([0x03, 0xe8]);
    }

    outgoing.fin = true;

    outgoing.opcode = 0x08;
    outgoing.length = message.length;

    outgoing.write(message);
    outgoing.end();

    return this;
};

WebSocket.prototype._read = function() {
    var incoming = this._incoming;

    if (!incoming) return;

    var chunk = incoming.read();

    if (chunk === null)
        return this.push('');

    return this.push(chunk);
    
    /*
    var incomings = this._incomings;

    if (!incomings.length) return;

    incomings.sort(function(a, b) {
        if (a._id < b._id)
            return -1;
        if (a._id > b._id)
            return 1;

        return 0;
    });

    for (var i = 0; i < incomings.length; i++) {
        var chunk = incomings[i].read();

        if (chunk === null)
            this.push('');
        else
            this.push(chunk);
    }
    */
};

WebSocket.prototype._write = function(chunk, encoding, done) {
    var outgoing = this._wscore._outgoing;

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
    var wscore = new WebSocketCore(source, options);

    wssocket._wscore = wscore;

    wssocket._wscore.on('request', function(request) {
        var err = validateRequest(request);

        if (err) wssocket.close(1002);

        if (!request.fin && request.opcode)
            wssocket._opcode = request.opcode;

        var opcode = request.opcode;

        if (!request.opcode)
            opcode = wssocket._opcode;

        wssocket._incoming = request;

        request.on('readable', function() {
            wssocket.read(0);
        });

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
    request.once('end', function() {
        request.removeAllListeners();


        if (request.fin) {
            wssocket.write(new Buffer(0));
            wssocket.emit('stream:end');
        }
    });

    wssocket.emit('stream:start');
};

function handlePingFrame(wssocket, request, wscore) {
    var outgoing = wssocket._wscore._outgoing;

    request.once('end', function() {
        var message = wssocket.read() || emptyBuffer;

        request.removeAllListeners();

        outgoing.fin = true;
        outgoing.opcode = 0x0a;
        outgoing.length = message.length;

        outgoing.write(message);
        outgoing.end();
        
        wssocket.emit('ping', message);
    });
}

function handlePongFrame(wssocket, request) {
    request.once('end', function() {
        var message = wssocket.read() || emptyBuffer;

        request.removeAllListeners();

        wssocket.emit('pong', message);
    });
}

function handleCloseFrame(wssocket, request, wscore) {
    var message, code, wscore = wssocket._wscore;
    
    request.once('end', function() {
        var payload = wssocket.read() || emptyBuffer;

        wscore.push(null);
        wscore.end();

        request.removeAllListeners();

        if (payload.length == 2) {
            code = payload.readUInt16BE(0);
            message = CLOSE_CODES[code];

            if (!message)
                code = message = null;
        }

        wssocket.emit('close', payload, code, message);
    });
}

function handleMessageFrame(wssocket, request) {
    request.once('end', function() {
        var message = wssocket.read() || emptyBuffer;

        request.removeAllListeners();

        wssocket.emit('message', message.toString());
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

function normalize(message) {
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
