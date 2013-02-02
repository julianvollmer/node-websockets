var util = require('util');
var events = require('events');

var inherits = util.inherits;
var EventEmitter = events.EventEmitter;

var WebSocketStream = require('./stream');

/**
 * Base class of the WebSocket implementation.
 * 
 * @param   {Object}    options
 */
function WebSocket(options) {
    var self = this;
    
    this.isServer = (options.isServer || !options.isClient);

    this.extensions = {};
    this.extensionNames = [];
    this.enabledExtensions = [];

    this.stream = new WebSocketStream(options);
    this.stream.on('open', function() {
        self.emit.apply(self, ['open'].concat([].slice.call(arguments))); 
    });
    this.stream.on('data', function(data) { 
        var exts = [];
        var extensions = self.extensions;
        var enabledExtensions = self.enabledExtensions;

        enabledExtensions.forEach(function(enExt) {
            if (extensions.hasOwnProperty(enExt)) {
                exts.push(extensions[enExt]);
            } 
        });

        exts.forEach(function(ext) {
            console.log('ext data', data);
            data = ext(data);
        });

        self.emit.apply(self, ['message', data]); 
    });
    this.stream.on('close', function() { 
        self.emit.apply(self, ['close'].concat([].slice.call(arguments))); 
    });
}

inherits(WebSocket, EventEmitter);

/**
 * Sends some string data to the other end of the socket.
 * 
 * @param   {String}    data
 * @return  {Boolean}
 */
WebSocket.prototype.send = function(data) {
    var options = {};
    
    if (typeof data == 'string') {
        data = new Buffer(data);
    }
    
    options.masked = !this.isServer;
    options.opcode = 0x1;
    options.data = data;
    
    this.stream.custom(options);
    
    return true;
};

/**
 * Closes current socket connection.
 * 
 * @return  {WebSocket}
 */
WebSocket.prototype.close = function() {
    this.stream.end();
    
    return this;
};

/**
 * Is executed when receiving a ping frame.
 */
WebSocket.prototype._ping = function() {
    this._pong();
};

/**
 * Sends a pong frame.
 */
WebSocket.prototype._pong = function() {
    this.stream.custom({
        masked: false,
        opcode: 0xA,
        length: 0,
        data: null
    });
};

/**
 * Binds this WebSocket to a standing socket connection.
 * 
 * @param   {Socket}    socket
 * @return  {WebSocket}
 */
WebSocket.prototype.assignSocket = function(socket) {
    this.stream.assignSocket(socket);
    
    return this;
};

WebSocket.prototype.hasExtension = function(name) {
    var exts = this.extensions;

    return exts.hasOwnProperty(name);
};

WebSocket.prototype.addExtension = function(name, ext) {
    var exts = this.extensions;
    var extNames = this.extensionNames;

    exts[name] = ext;
    extNames.push(name);

    return this;
};

WebSocket.prototype.removeExtension = function(name) {
    var exts = this.extensions;
    var extNames = this.extensionNames;

    if (this.hasExtension(name)) {
        delete exts[name];
    }

    extNames.forEach(function(extName, index) {
        if (name === extName) {
            extNames.splice(index, index);
        } 
    });

    // TODO: check if reference is affected
    console.log(this.extensionNames);
    console.log(extNames);

    return this;
};

module.exports = WebSocket;