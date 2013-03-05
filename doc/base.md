# WebSocketBase

    Stability: 1 - Experimental; Event and method names are settling down
    but arguments changes will likely be done.
    
Use `require('websockets').Base` to access this module.

## Class: WebSocketBase

The WebSocketBase class provides a high-level api to multiple ws connections.

### new WebSocketBase([options])

* `options` Object, Optional

Will return a new instance of the WebSocketBase.
Default parameters can be overwritten in optional options hash.
Options hash can contain `mask` with bool which determinates if frames should be 
masked (defaults to `false`), `url` with websocket url (defaults to `ws://localhost:3000`),
timeout in ms (defaults to `600000`) and the amount of maxConnections (defaults to `10`).

### Event: 'open'

`function(sid) { }`

Emitted each time a new socket is assigned.
`sid` can be used for sending something only to the new endpoint
for example to provide him the data to start with.

### Event: 'pong'

`function(message, sid) { }`

Emitted when a pong frame is send (after a ping request).
`message` is the frame payload as string `sid` is the id of the corresponding `WebSocketSocket` 
and can be used for specific interaction to only this endpoint.

### Event: 'close'

`function(reason, sid) { }`

Emitted when the connection of `sid` has been closed.
`reason` should be a string which contains the close reason.

### Event: 'error'

`function(error) { }`

Emitted when an error happens (e.g. too big frame, invalid frame encoding).
`error` should be an instance of `Error` the developer should decide what then to do.

### Event: 'message'

`function(message, sid) { }`

Emitted each time a text frame is received.
`message` is the payload as string and `sid` the id of the endpoint which has sent the frame.

### wsbase.send(data)

Sends a `String` or `Buffer` to all connected WebSockets.

### wsbase.send(sid, data)

Sends a `String` or `Buffer` to a specified endpoint (`sid`).
You can specify multiple endpoints by providing the sids as `Array`.

### wsbase.ping([data])

Sends a `ping` frame to all connected WebSockets which can contain data as `Buffer` or `String`.

### wsbase.ping([sid], [data])

Sends a `ping` frame to one or multiple specified endpoints (`sid`) which can contain data as `Buffer` or `String`.

### wsbase.close(sid, [reason])

Sends a `close` frame to one or multiple specified endpoints (`sid` or `Array` of `sids`) which can contain a reason as
`Buffer` or `String` and closes the underlaying socket. Will emit a `close` event.

### wsbase.assignSocket(socket, [options])

* `socket`, Socket
* `options`, Object, Optional

Binds a node socket to the api of the `WebSocketBase`.
This method is most used internally after a http upgrade handle.
`options` can contain specific settings for the WebSocket which may be figured out after an upgrade (e.g. extensions).

### wsbase.extensions

Contains an object storage of usable extensions. Extensions are objects with `read` and `write` function.
The property name of wsbase.extensions is used as identifier in `Sec-WebSocket-Extensions` headers on
`WebSocketServer` and `WebSocketClient` implementations.
