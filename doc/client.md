# WebSocketClient

    Stability: 3 - Stable; Most changes will happen in WebSocketBase. The ability to open a conenction manuelly also will not change I think.

Access this module with `require('websockets').Client`.

## Class: WebSocketClient

Extends the `WebSocketBase` class to match requirements for a client implementation.

### new WebSocketClient([options])

Example:

    var wsclient = new WebSocketClient({ timeout: 30000 });

* `options` {Object}, Optional options.
    * `url` {String}, Url to connect to (can be also used in open).
    * `timeout` {Number}, Time in ms when an idling socket is closed.

Returns an instance of the WebSocketClient class.

### wsclient.open(url)

Example:

    wsclient.open('ws://localhost:3000');

* `url` {String}, Url to connect to, Default: `ws://localhost:3000`.

Will send an http upgrade request to the server and establish a WebSocket connection.
