# WebSocketServer

    Stability: 3 - Stable; 
    There will only be small api changes in future.

Access this module with `require('websockets').Server`

## Class: WebSocketServer

Extends `WebSocketBase` with `WebSocketUpgrade` to server WebSocket connections.

### new WebSocketServer([options])

Example:

    var wsserver = new WebSocketServer({ maxConnections: 4 });

* `options`, Object, Optional options hash which overwrites internal parameters.
    * `url`, String, Url which the server will listen on upgrades, Default: `ws://localhost:3000`
    * `timeout`, Number, Timeout in ms for idling sockets, Default: `600000`
    * `extensions`, Object, See (wsbase.extensions)[https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md#wsbaseextensions] for more, Default: none
    * `maxConnections`, Number, Amount of sockets which can be conencted, Default: `10`

Returns an instance of `WebSocketServer`.

### wsserver.listen(server)

Example:

    var server = http.createServer();
    var wsserver = new websockets.Server({ url: "ws://localhost" });
    
    wsserver.listen(server);

Uses an instance of `http.Server` to bind to upgrade requests.

### wsserver.broadcast(message)

Example:

    wsserver.broadcast('This message is for all my clients.');

Broadcasts a `String` or `Buffer` as message frame to all connected sockets.

### Event: 'open'

Check (WebSocketBase: Events: 'open')[https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md#event-open] for more.

### Event: 'close'

Check (WebSocketBase: Events: 'close')[https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md#event-close] for more.

### Event: 'error'

Check (WebSocketBase: Events: 'error')[https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md#event-error] for more.

### Event: 'message'

Check (WebSocketBase: Events: 'message')[https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md#event-message] for more.
