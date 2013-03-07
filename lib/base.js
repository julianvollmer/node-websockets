var url = require('url');
var util = require('util');
var events = require('events');
var crypto = require('crypto');

var parse = url.parse;
var inherits = util.inherits;

var EventEmitter = events.EventEmitter;

var WebSocketSocket = require('./socket');

function WebSocketBase(options) {
    options = (options || {});

    // defaults
    this.mask = false;
    
    this.sockets = {};
    this.socketsHistory = [];

    this.extensions = {};
 
    this.timeout = 600 * 1000;
    this.connections = 0;
    this.maxConnections = 10;
    
    this.url = url.parse('ws://localhost');
    
    // overwrite parameters with options
    if (options.mask)
        this.mask = options.mask;
    if (options.url)
        this.url = parse(options.url);
    if (options.timeout)
        this.timeout = options.timeout;
    if (options.maxConnections)
        this.maxConnections = options.maxConnections;
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

WebSocketBase.prototype.close = function(sids, reason) {
    // TODO: close all connections on no sids
    if (arguments.length == 1) {
        sid = null;
        reason = sid;
    
        return;
    }
 
    var self = this;
    [].concat(sids).forEach(function(sid) {
        self._write(sid, 0x08, reason);
        self.sockets[sid] = null;
        self.socketsHistory.splice(self.socketsHistory.indexOf(sid), 1);
        self.connections--;
    });

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

    var sid = generateSid();

    socket.setTimeout(this.timeout);

    socket = new WebSocketSocket(socket, opts);

    socket.on('text', function(message) {
        self.emit('message', message, sid);
    });
    
    socket.on('pong', function(message) {
        self.emit('pong', message, sid);
    });
    
    socket.on('close', function(reason) {
        self.sockets[sid] = null;
        self.socketsHistory.splice(self.socketsHistory.indexOf(sid), 1);
        self.connections--;
        self.emit('close', reason, sid);
    });
    
    this.sockets[sid] = socket;
    this.socketsHistory.push(sid);

    for (var i = 0; this.socketsHistory.length > this.maxConnections; i++)
        this.close(this.socketsHistory[i], 'maxConnections reached.');
        
    // TODO: while socketsHistory bigger than maxConnections
    // close the first items of socketsHistory

    this.connections++;

    this.emit('open', socket);
};

WebSocketBase.prototype._write = function(sids, opcode, data) {
    if (data !== undefined && !Buffer.isBuffer(data))
        data = new Buffer(data);

    if (sids === null) {
        for (var key in this.sockets) {
            var socket = this.sockets[key];
            if (socket)
                socket.write(opcode, data);
        }
    } else {
        var self = this;
        [].concat(sids).forEach(function(sid) {
            var socket = self.sockets[sid];
            if (socket)
                socket.write(opcode, data);
        });
    }
};

function generateSid() {
    return crypto.randomBytes(2).toString('hex');
}

module.exports = WebSocketBase;
