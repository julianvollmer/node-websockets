# WebSocketClient

    Stability: 3 - Stable; 
    Most changes will happen in WebSocketBase. 

Access this module with `require('websockets').Client`.

## Class: WebSocketClient

Extends Events and methods of `WebSocketBase` class to match requirements for a client implementation.
As syntactic sugar the `WebSocketClient` class provides shortcut methods to the `WebSocketSocket` 
instance (there is only one because this is a client...) like `send`, `ping`, `close`.

### new WebSocketClient([options])

Example:

    var wsclient = new WebSocketClient({ timeout: 30000 });

* `options`, Object, Optional options.
    * `url`, String, Url to connect to (can be also used in open).
    * `timeout`, Number, Time in ms when an idling socket is closed.

Returns an instance of the WebSocketClient class.

### wsclient.open(url)

Example:

    wsclient.open('ws://localhost:3000');

* `url`, String, Url to connect to, Default: `ws://localhost:3000`.

Will send an http upgrade request to the server and establish a WebSocket connection.

### wsclient.send(message)

Example:

    wsclient.send('Hello');

This method is a shortcut to `wssocket.send`.
Check [wssocket.send](https://github.com/bodokaiser/node-websockets/blob/master/doc/socket.md#wssocketsendmessage)
for further information.

### wsclient.ping([message])

Example:

    wsclient.ping();

This method is a shortcut to `wssocket.ping`.
Check [wssocket.ping](https://github.com/bodokaiser/node-websockets/blob/master/doc/socket.md#wssocketpingbody)
for further information.

### wsclient.close([reason])

Example:

    wsclient.close();

This method is a shortcut to `wssocket.close`.
Check [wssocket.close](https://github.com/bodokaiser/node-websockets/blob/master/doc/socket.md#wssocketclosereason)

### Event: 'open'

Check [WebSocketBase: Event: 'open'](https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md#event-open)
for further information.

### Event: 'close'

Check [WebSocketBase: Event: 'close'](https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md#event-close)

### Event: 'error'

Check [WebSocketBase: Event: 'error'](https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md#event-error)

### Event: 'message'

Check [WebSocketBase: Event: 'message'](https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md#event-message)
