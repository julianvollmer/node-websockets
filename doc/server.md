# WebSocketServer

    Stability: 3 - Stable; There will only be changes on WebSocketBase in future.

Access this module with `require('websockets').Server`

## Class: WebSocketServer

Extends `WebSocketBase` with `WebSocketUpgrade` to server WebSocket connections.

### new WebSocketServer([options])

Example:

    var wsserver = new WebSocketServer({ maxConnections: 4 });

* `options` {Object}, Optional options hash which overwrites internal parameters.
    * `url` {String}, Url which the server will listen on upgrades, Default: `ws://localhost:3000`
    * `timeout` {Number}, Timeout in ms for idling sockets, Default: `600000`
    * `maxConnections` {Number}, Amount of sockets which can be conencted, Default: `10`

Returns an instance of `WebSocketServer`.

### wssclient.listen(server)

Example:

    var server = http.createServer();
    var wsserver = new websockets.Server({ url: "ws://localhost" });
    
    wsserver.listen(server);

Uses an instance of `http.Server` to bind to upgrade requests.
