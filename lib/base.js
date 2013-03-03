var url = require('url');
var util = require('util');
var events = require('events');

var WebSocketSocket = require('./socket');

var inherits = util.inherits;
var EventEmitter = events.EventEmitter;

function WebSocketBase(options) {
    // defaults
    this.mask = false;
    this.sockets = [];
    this.extensions = [];
    this.counter = 0;
    this.connected = 0;
    this.maxConnections = 10;
    this.url = url.parse('ws://localhost:3000');
    
    // overwrite parameters with options
    if (options && options.mask)
        this.mask = options.mask;
    if (options && options.url)
        this.url = url.parse(options.url);
    
    // we strictly require a path property in url
    this.url.path = (this.url.path || '/');

    // TODO: upcoming options
    //this.strict = options.strict || false;
    //this.maxTimeout = options.maxTimeout || 400;
    //this.maxPayloadSize = options.maxPayloadSize || 20000;
}

inherits(WebSocketBase, EventEmitter);

WebSocketBase.prototype.send = function(sid, data) {    
    var self = this;

    if (arguments.length == 1) {
        data = sid;
        sid = null;
    }
    
    this._write(sid, 0x01, data);

    return this;
};

WebSocketBase.prototype.ping = function(sid, data) {
    var self = this;

    if (arguments.length == 1) {
        data = sid;
        sid = null;
    }

    this._write(sid, 0x09, data);

    return this;
};

WebSocketBase.prototype.close = function(sid, reason) {
    if (arguments.length == 1) {
        sid = null;
        reason = sid;
    }
 
    this._write(sid, 0x08, reason);

    // TODO: remove closed sockets from internal storage

    return this;
};

WebSocketBase.prototype.assignSocket = function(socket, options) {
    var self = this;
    
    var opts = {};
    if (options && options.extensions) {
        opts.extensions = {};
        options.extensions.forEach(function(name) {
            opts.extensions[name] = self.extensions[name];
        });
    }

    var sid = this.connected;

    socket = new WebSocketSocket(socket, opts);

    socket.on('text', function(message) {
        self.emit('message', message, sid);
    });
    
    socket.on('pong', function(message) {
        self.emit('pong', message, sid);
    });
    
    socket.on('close', function(reason) {
        self.emit('close', reason, sid);
    });
    
    this.sockets.push(socket);
    
    this.connected++;

    this.emit('open', socket);
};

WebSocketBase.prototype._write = function(sid, opcode, data) {
    if (data !== undefined && !Buffer.isBuffer(data))
        data = new Buffer(data);

    if (sid === null) {
        this.sockets.forEach(function(socket) {
            socket.write(opcode, data);
        });
    } else {
        var socket = this.sockets[sid];
        if (socket)
            socket.write(opcode, data);
    }
};

module.exports = WebSocketBase;
