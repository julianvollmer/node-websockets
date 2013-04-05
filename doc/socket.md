# WebSocket

    Stability: 2 - Unstable;
    There only may be changes around the stream apis.

Access this module with `require('websockets').Socket`

## Class: WebSocket

The `WebSocket` class uses `WebSocketStream` as back-end for reading and
writing WebSocket frames. But it adds control frame managment and a high-level
api to it. In connection with `WebSocketUpgrade.createUpgradeRequest` it can be
used as WebSocket client.

### new WebSocket(socket, [options])

Example:

    var wsserver = new WebSocket(source, { mask: true });

* `source`, Duplex, preferable a `socket`    
* `options`, Object, option hash
    * `mask`, Boolean, overwrites the default value of `false`
    * `opcode`, Number, `0x01` for utf8 and `0x02` for binary mode

The constructor is wrapping the `source` into a `WebSocketStream` instance and
then binding to its `head` event.

### wssocket.send([message])

Example:

    wssocket.send('Hello this is a text-frame message');

Send can be used to send short text-messages to the WebSocket.

### wssocket.ping([message])

Example:

    wssocket.ping();

`ping()` sends a ping frame with optional body to the endpoint. The endpoint
should than answer with a pong frame which will be shared through a `pong`
event.

### wssocket.close([message])

Example:

    wssocket.close();
    wssocket.close(1001);

Closes a WebSocket connection by sending a close frame with optional payload
which either can be a status code or a string implying the reason.

### wssocket.stream([chunk])

Example:

    // lets stream a lot of random stuff
    wssocket.stream(crypto.randomBytes(200));
    wssocket.stream(crypto.randomBytes(200));
    wssocket.stream(crypto.randomBytes(200));
    wssocket.stream(crypto.randomBytes(200));
    wssocket.stream(); // sends the final frame

This will start a stream of frames. You end the stream by calling `stream()`
without any parameters.

### Event: "message"

Example:

    wssocket.on('message', function(message) {
        wssocket.send('You told me: ' + message);
    });

Each simple text frame (this means unfragmented and smaller than 16kb) will be
emitted with this "message" event.

### Event: "pong"

Example:

    wssocket.once('pong', function(message) {
        console.log('pong: ' + new Data());
    });
    console.log('ping: ' + new Date());
    wssocket.ping();

When receiving a pong frame a `pong` frame will get emitted. It can be used to
test out latency or to check the connection.

### Event: "close"

Example:

    wssocket.once('close', function(message) {
        console.log('connection was classed because of', message.toString());
    });

When we receive a close frame or the socket itself closes then we emit a
`close` event.

### Event: "stream:start"

Example:

    wssocket.on('stream:start', function() {
        // parse traditionally
        wssocket.on('readable', parseIncome);
    });

    wssocket.on('stream:start', function() {
        // pipe back to socket
        wssocket.pipe(wssocket);
    });

Is emitted when a frame stream begins. It can be used to set up listeners on
the sockets `readable` event (internally `wsstream` pipes all stream data to
the `wssocket`) or to repipe chunk somewhere else.

### Event: "stream:stop"

Example:

    wssocket.on('stream:stop', function() {
        // remove listeners
        wssocket.removeListener(parseIncome);
    });

Is emitted when frame stream is finished. Can be used to remove listeners or
unpipe from stream.
