var url = require('url');
var util = require('util');
var events = require('events');

var WebSocketFrame = require('./frame');

/**
 * WebSocketBase class.
 * 
 * The WebSocketBase class is the parent class of the final class of server
 * and client. If you want to try some own specific implementations inherit
 * from here.
 * 
 * @param   {Object}    options
 * @event   'open'      is emitted on connection
 * @event   ‘close'     is emitted on disconnection        
 * @event   ‘message'   is emitted on incoming message
 * @parent  {EventEmitter} 
 */
function WebSocketBase(options) {
    // defaults
    this.masked = false;
    // stores read middleware
    this.readChain = [];
    // stores write middleware
    this.writeChain = [];
    // stores extensions
    this.extensions = [];
    // stores parsed url object
    this.url = url.parse('ws://localhost:3000');
    
    // overwrite mask setting
    if (options && options.hasOwnProperty('mask')) {
       this.masked = options.mask;
    }

    // overwrite default url
    if (options && options.hasOwnProperty('url')) {
        this.url = url.parse(options.url);
    }
    
    // bug fix a small incompatibility with url.parse
    if (!this.url.hasOwnProperty('path')) {
        this.url.path = '/';
    }

    // TODO: upcoming options
    //this.strict = options.strict || false;
    //this.masked = options.masked || false;
    //this.extensions = options.extensions || {};
    //this.maxClients = options.maxClients || 100;
    //this.maxTimeout = options.maxTimeout || 400;
    //this.maxPayloadSize = options.maxPayloadSize || 20000;
    
}

// adds event function to class
util.inherits(WebSocketBase, events.EventEmitter);

/**
 * Sends some data.
 * 
 * This method sends some data as buffer to the other end of the WebSocket.
 * It returns true if sent and false if queued.
 * 
 * @param   {String/Buffer}    data
 * @return  {Boolean}
 */
WebSocketBase.prototype.send = function(data) {    
    var isStr = (typeof data === 'string');
    
    var opcode = (isStr) ? 0x01 : 0x02;
    var payload = (isStr) ? new Buffer(data) : data;
    
    return this._writeFrame(opcode, payload);    
};

/**
 * Sends a ping frame.
 * 
 * This method will send a ping frame through the wire usually the endpoint
 * should send back a pong frame which then should emit a 'pong' event.
 * 
 * @param   {Buffer}    data
 * @event   'pong'  is emitted when pong frame is received
 * @return  {Boolean}
 */
WebSocketBase.prototype.ping = function(data) {
    var isStr = (typeof data === 'string');
    var payload = (isStr) ? new Buffer(data) : data;
    
    return this._writeFrame(0x09, payload);
};

/**
 * Closes the connection.
 * 
 * This method will close the current connection by sending a close frame
 * which contains the reason for disconnection and immediately close the socket.
 * 
 * @param   {Buffer}    reason
 */
WebSocketBase.prototype.close = function(reason) {
    //writeFrame.call(this, 0x08, reason); // uncommenting this will fuck up the node process
    
    this.socket.end();
    
    this.emit('close', reason);
};

/**
 * Checks if extension is registered.
 * 
 * This method allows to control if a extension has been added.
 * 
 * @param   {String}    name
 * @param   {Boolean}
 */
WebSocketBase.prototype.hasExtension = function(name) {
    if (typeof name != 'string')
        throw new Error('name must be a string');
    
    var exists = false;
    var extens = this.extensions;
    
    for (var i = 0; i < extens.length; i++) {
        if (extens[i].name == name) {
            exists = true;
        }
    }

    return exists;
};

/**
 * Adds an extension to the websocket.
 * 
 * This method will add an extension to the internal extension collection
 * wrapped in a object to keep state like enabled and so on.
 * 
 * @param   {String}    name
 * @param   {Function}  read
 * @param 	{Function} 	write
 * @return 	{WebSocketBase}
 */
WebSocketBase.prototype.addExtension = function(name, read, write) {
    if (typeof name != 'string') 
        throw new Error('name must be a string');
    if (typeof read != 'function')
        throw new Error('read must be a function');
    if (typeof write != 'function')
        throw new Error('write must be a function');

    if (!this.hasExtension(name)) {
        this.extensions.push({ name: name,  read: read, write: write, enabled: false });
    }

    return this;
};

/**
 * Removes an extension from the websocket.
 * 
 * This method will remove an extension from the internal extension collection
 * and return this.
 * 
 * @param   {String}    name
 * @return  {Boolean}
 */
WebSocketBase.prototype.removeExtension = function(name) {
    if (typeof name != 'string')
        throw new Error('name must be a string');
    
    if (this.hasExtension(name)) {
        var extens = this.extensions;
        for (var i = 0; i < extens.length; i++) {
            extens.splice(i, 1);
        }
    }

    return this;
};

WebSocketBase.prototype.enableExtension = function(name, reload) {
    if (typeof name != 'string')
        throw new Error('name must be a string');

    var extens = this.extensions;

    for (var i = 0; i < extens.length; i++) {
        var exten = extens[i];
        if (name = exten.name)
            exten.enabled = true;
    }

    if (reload || reload === undefined)
        this.reloadExtensions();

    return this;
};

WebSocketBase.prototype.disableExtension = function(name, reload) {
    if (typeof name != 'string')
        throw new Error('name must be a string');
    
    var extens = this.extensions;

    for (var i = 0; i < extens.length; i++) {
        var exten = extens[i];
        if (name == exten.name)
            exten.enabled = false;
    }

    if (reload || reload === undefined)
        this.reloadExtensions();

    return this;
};

WebSocketBase.prototype.reloadExtensions = function() {
    var extens = this.extensions;
    var rchain = this.readChain = [];
    var wchain = this.writeChain = [];

    for (var key in extens) {
        var exten = extens[key];
        if (exten.enabled) {
            rchain.push(exten.read);
            wchain.push(exten.write);
        }
    }

    return this;
};

/**
 * Assigns a tcp socket object to the WebSocket.
 * 
 * Because piping streams is only nice when reading data we will bind directly
 * to the events with this method. It should be used at the upgrade process.
 * 
 * @param   {Socket}    socket
 */
WebSocketBase.prototype.assignSocket = function(socket) {
    var self = this;
    
    this.socket = socket;
    this.socket.on('data', function(data) {
        self._readFrame(data);
    });
    this.socket.on('end', function(reas) {
        self.close(reas);
    });
    
    this.emit('open');
};

/**
 * Handles incoming websocket frames.
 * 
 * This method is executed when the socket emits a data event.
 * It will decode the frames content and handle control frames.
 * 
 * @param   {Buffer}    data
 */
WebSocketBase.prototype._readFrame = function(data) {
    var self = this;
    var frame = new WebSocketFrame(data);
    
    if (!frame.isValid()) {
        this.emit('error', 'invalid frame');
        
        return;
    }
    
    execChain(this.readChain.concat(done), frame);

    function done(next, frame) {
        switch (frame.opcode) {
            case 0x00:
                // set a flag that we are in continuation mode
                // save the first frame we found in the context
                // add so much frame fragments until we have a 0x1 or 0x2
                break;
            case 0x01:
                self.emit('message', frame.content.toString());
                break;
            case 0x02:
                self.emit('message', frame.content);
                break;
            case 0x08:
                self.close(frame.content.toString());
                break;
            case 0x09:
                self._writeFrame(0x0a, frame.content);
                break;
            case 0x0a:
                self.emit('pong', frame.content);
                break;
            default:
                self.emit('error', 'reserved opcode in use');
                break;
        }
    }
};

/**
 * Handles outgoing websocket frames.
 * 
 * This method is executed when sending some data through the WebSocket.
 * It will built a frame around the provided payload of the send method and
 * return true if sent immediatly or false if buffered.
 * 
 * @param   {Number}    opcode
 * @param   {Buffer}    content
 * @return  {Boolean}
 */ 
WebSocketBase.prototype._writeFrame = function(opcode, content) {
    var self = this;

    var mask = this.masked;
    var length = content.length;
   
    function start(next, frame) {
        frame.fin = true;
        frame.mask = mask;
        frame.opcode = opcode;
        frame.length = length;
        frame.content = content;
        
        next(null, frame);
    }

    function done(next, frame) {
        self.socket.write(frame.toBuffer());
    }

    
    execChain([start].concat(this.writeChain, done), new WebSocketFrame());
};

function execChain(chain, content, context) {
    var index = -1;

    function next(err, result) {
        if (err) self.emit('error', err);
        index++;
        if (index < chain.length) {
            chain[index].call(context, next, result);
        }
    }

    next(null, content);

}

// exports class as module
module.exports = WebSocketBase;
