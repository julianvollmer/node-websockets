# WebSocketBase

    Stability: 1 - Experimental; Event and method names are settling down
    but arguments changes will likely be done.
    
Use `require('websockets').Base` to access this module.

## Class: WebSocketBase

The WebSocketBase class provides a high-level api for handling ws connections.

### new WebSocketBase([options])

Example:

    var wsbase = new WebSocketBase({ mask: true });

* `options`, Object, Optional
    * `url`, String, Contains the websocket url, Default: `ws://localhost:3000/`
    * `mask`, Boolean, Determinates if frames should be masked, Default: `false`
    * `timeout`, Number, Time in ms when an idling socket is closed, Default: `600000`
    * `extensions`, Object, See `wsbase.extensions` below for more information, Default: none
    * `maxConnections`, Number, Amount of maximal concurrent connections, Default: `10`

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

### wsbase.assignSocket(socket, [options])

* `socket`, Socket
* `options`, Object, Optional
    * `mask`, Boolean, Does the endpoint should receive masked frames, Default: `this.mask`
    * `extensions`, Object, Contains `Array` of extensions supported by both endpoints, Default: `null`

Binds a node socket to the api of the `WebSocketBase`.
This method is most used internally after a http upgrade handle and only should be used wise.

### Event: 'open'

Example:

    wsbase.on('open', function(wssocket) {
        wssocket.send('Hello new WebSocket.');
    });

Emitted each time a new socket is assigned. The invoked `WebSocketSocket` instance
is passed as parameter for direct communication.

### Event: 'pong'

Example:

    wsbase.on('pong', function(message, wssocket) {
        wssocket.send('You have pinged me?');
    });

Emitted when a pong frame is send (after a ping request). `message` is the frame 
payload as string and `wssocket` the instance of the corresponding `WebSocketSocket`.

### Event: 'close'

Example:

    wsbase.on('close', function(reason, wssocket) {
        console.log(util.format('WebSocket #%d has left us', wssocket.index));
    });

Emitted when a WebSocket connection closes. Passes optional reason and leaving
`wssocket` instance as arguments. `wssocket` will be removed out of socket storage.

### Event: 'error'

Example:

    wsbase.on('error', function(error) {
        // because we are in developement, app should crash
        throw error;
    });

Emitted when an error happens (e.g. too big frame, invalid frame encoding).
`error` should be an instance of `Error` the developer can decided how to proceed.

### Event: 'message'

Example:

    wsbase.on('message', function(message, wssocket) {
        wssocket.send('You have sent me ' + message);
    });

Emitted each time a text frame is received. `message` is the payload as string if
we have a text frame or a buffer if we have a binary frame. `wssocket` is the 
instance of `WebSocketSocket` which has sent us the messsage.
