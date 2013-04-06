# WebSocketServer

    Stability: 2 - Unstable; 
    Theere will be changes around the streaming api.

Access this module with `require('websockets').Server`

## Class: WebSocketServer

The `WebSocketServer` class handles multiple WebSocket connections. It uses
internally `WebSocketUpgrade` for the http upgrade process and `WebSocket` for
parsing and reading WebSocket frames. The class itself is a `Writable` stream
which can write streams to all connected sockets.

### new WebSocketServer([options])

Example:

    var wsserver = new WebSocketServer({ maxConnections: 4 });

* `options`, Object, Options hash.
    * `url`, String, Url server will listen to, Default: `ws://localhost:3000`.
    * `timeout`, Number, Timeout in ms for idling sockets, Default: `600000`.
    * `maxConnections`, Number, Max amount of connections, Default: `10`.

Returns an instance of `WebSocketServer`.

### wsserver.write(chunk)

Example:

    // write first frame stream fragment
    wsserver.write(new Buffer([0x01, 0x02, 0x03]));
    // write second frame stream fragment
    wsserver.write(new Buffer([0x04, 0x05, 0x06]));
    // write last frame stream fragment
    wsserver.write(new Buffer(0));

Will write frame stream to all connected sockets. In the background it just
loops through the sockets array and and calls the `WebSocket` instances
`write()`. You need to end the stream by writting an empty buffer.

### wsserver.listen(server)

Example:

    var server = http.createServer();
    var wsserver = new websockets.Server({ url: "ws://localhost" });
    
    wsserver.listen(server);

Uses an instance of `http.Server` to bind to upgrade requests.

### wsserver.broadcast(head, message)

Example:

    wsserver.broadcast(
            { fin: true, opcode: 0x01 }, 
            new Buffer('This message is for all my clients.')
    );

Broadcasts a `message` buffer through all connected sockets. In the `head` we
define the flag we set in the head bytes. This is strictly required.

### Event: 'open'

Example:

    wsserver.on('open', function(wssocket) {
        wssocket.send('Hello new WebSocket.');
    });

Emitted each time a new socket is assigned. The invoked `WebSocket` instance is 
passed as parameter for direct communication.

### Event: 'pong'

Example:

    wsserver.on('pong', function(message, wssocket) {
        wssocket.send('You have pinged me?');
    });

Emitted when a pong frame is send (after a ping request). `message` is the 
frame payload as string and `wssocket` the instance of the endpoint.

### Event: 'close'

Example:

    wsserver.on('close', function(code, wssocket) {
        console.log(wssocket.id + ':' + code);
    });

Emitted when a WebSocket connection closes. Passes a closing code and the 
leaving `wssocket` instance as arguments. `wssocket` will be removed out of 
socket storage.

### Event: 'error'

Example:

    wsserver.on('error', function(error) {
        // just log it
        console.log(error);
    });

Emitted when an error happens (e.g. too big frame, invalid frame encoding).
`error` should be an instance of `Error` the developer can decided how to 
proceed.

### Event: 'message'

Example:

    wsserver.on('message', function(message, wssocket) {
        wssocket.send('You have sent me ' + message);
    });

Emitted each time a text frame is received. `message` is the payload as string 
if we have a text frame or a buffer if we have a binary frame. `wssocket` is the 
instance of `WebSocketSocket` which has sent us the messsage.

### Event: 'stream:start'

Example:

    // a wssocket wants to stream a big image to other clients
    wsserver.on('stream:start', function(wssocket) {
        wssocket.pipe(wsserver);
    });

Emitted when a stream of fragmented frames or chunked payload starts. You can
set up you listeners on this event.

### Event: 'stream:end'

    // unpipe from the wssocket
    wsserver.on('stream:stop', function(wssocket) {
        wssocket.unpipe(wsserver);
    });

Emitted when a stream of fragmented frames or a chunked payload finishes. It
should be used to remove listeners in order to not disturb other channels.
