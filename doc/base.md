# WebSocketBase

    Stability: 1 - Experimental; Event and method names are settling down
    but arguments changes will likely be done.
    
Use `require('websockets').Base` to access this module.

## Class: WebSocketBase

The WebSocketBase class provides a high-level api for handling ws connections.

### new WebSocketBase([options])

Example:

    var wsbase = new WebSocketBase({ mask: true });

* `options` {Object}, Optional
    * `url` {String}, Contains the websocket url, Default: `ws://localhost:3000/`
    * `mask` {Boolean}, Determinates if frames should be masked, Default: `false`
    * `timeout` {Number}, Time in ms when an idling socket is closed, Default: `600000`
    * `maxConnections` {Number}, Amount of maximal concurrent connections, Default: `10`

Will return a new instance of the WebSocketBase class.
You can set several parameters through object hash which may be necessary if you 
want to use WebSocketBase as client or server (e.g. masking) default is server settings.

### wsbase.extensions

Example:

    wsbase.extensions['x-test-extension'] = {
        read: function(next, wsf) {
            // first byte of payload is extension header
            // if heartbeat flag is set emit a custom event
            if (wsf.content[0] & 0x0f)
                wsbase.emit('heartbeat', wsf.content);       
            // or next on to handle frame normally by nexting 
            // the loop (first parameter is for errors)
            next(null, wsf);
        },
        write: function(next, wsf) {
            // push a header in front of the payload
            wsf.content = Buffer.concat(new Buffer(0x05), wsf.content);
            // use error machine if frame not valid
            if (wsf.isValid())
                return next(new Error('Invalid frame on write ext.'), wsf);
            // go on normally
            next(null, wsf);
        }
    };
    
Contains an object storage of usable extensions. Extensions are objects with `read` and `write` function.
The property name of wsbase.extensions is used as identifier in `Sec-WebSocket-Extensions` headers on
`WebSocketServer` and `WebSocketClient` implementations. The read and write functions are called with
a next function for passing the parsed extension to the next step or to handle errors and an instance of
`WebSocketFrame` for easy frame manipulation.

### wsbase.send(data)

Example:

    wsbase.send('some message');
    // or a buffer
    wsbase.send(new Buffer([0x04, 0x11]));

Sends a `String` (as text frame) or `Buffer` (as binary frame) to all connected WebSockets.

### wsbase.send(sid, data)

Example:

    wsbase.send('jd84', 'this is a private message');
    wsbase.send(['jd74', 'ld34'], 'this is only for your guys');

Sends a `String` or `Buffer` to a specified endpoint (`sid`).
You can specify multiple endpoints by providing the sids as `Array`.
Currently it is hard to get the `sid` when not listening on an event.

### wsbase.ping([data])

Example:

    wsbase.ping();

Sends a `ping` frame to all connected WebSockets which can contain data as `Buffer` or `String`.

### wsbase.ping([sid], [data])

Example:

    wsbase.ping(['jd85'], 'ping');

Sends a `ping` frame to one or multiple specified endpoints (`sid`) which can contain data as `Buffer` or `String`.

### wsbase.close(sid, [reason])

Example:

    wsbase.close('jd48');

Sends a `close` frame to one or multiple specified endpoints (`sid` or `Array` of `sids`) which can contain a reason as
`Buffer` or `String` and closes the underlaying socket. Will emit a `close` event.

### wsbase.assignSocket(socket, [options])

* `socket` {Socket}
* `options` {Object}, Optional
    * `mask` {Boolean}, Does the endpoint should receive masked frames, Default: `this.mask`
    * `extensions` {Object}, Contains `Array` of extensions supported by both endpoints, Default: `null`

Binds a node socket to the api of the `WebSocketBase`.
This method is most used internally after a http upgrade handle and only should be used wise.

### Event: 'open'

Example:

    wsbase.on('open', function(sid) {
        wsbase.send('New WebSocket connected.');
        wsbase.send(sid, 'Hello new WebSocket.');
    });

Emitted each time a new socket is assigned.
`sid` can be used for sending something only to the new endpoint
for example to provide him the data to start with.

### Event: 'pong'

Example:

    wsbase.on('pong', function(message, sid) {
        wsbase.send('A WebSocket has pinged me.');
        wsbase.send(sid, 'Here you have got your pong.');
    });

Emitted when a pong frame is send (after a ping request).
`message` is the frame payload as string `sid` is the id of the corresponding `WebSocketSocket` 
and can be used for specific interaction to only this endpoint.

### Event: 'close'

Example:

    wsbase.on('close', function(reason, sid) {
        wsb.send('WebSocket ' + sid + ' has left us.');
    });

Emitted when the connection of `sid` has been closed.
`reason` should be a string which contains the close reason.

### Event: 'error'

Example:

    wsbase.on('error', function(error) {
        // because we are in developement, app should crash
        throw error;
    });

Emitted when an error happens (e.g. too big frame, invalid frame encoding).
`error` should be an instance of `Error` the developer should decide what then to do.

### Event: 'message'

Example:

    wsbase.on('message', function(message, sid) {
        wsb.send('A WebSocket has sent ' + message);
    });

Emitted each time a text frame is received.
`message` is the payload as string and `sid` the id of the endpoint which has sent the frame.
