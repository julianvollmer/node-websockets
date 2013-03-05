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

An open event is emitted each time a new socket is assigned.
It contains the connected sid as parameter.

## Event: 'pong'

A pong event is always emitted when a pong frame is send (e.g. after a ping request).
It contains the sid and the ping payload as callback parameter.

## Event: 'close'

A close event is emitted when the connection was closed.
It provides sid and reason as callback parameters.

## event: "error"
An error event is emitted when an error happens (e.g. too big frame, invalid frame encoding).

## event: "message"
A message event is emitted each time a text frame is received.
The callback will get a sid and the string as message.

## send([sid,] data)
If both parameters are provided it will send some data (which can be a string or a buffer) to the specified endpoint (sid).
If only one parameter is provided it will send the data to all connected sockets.

## ping([sid,] data)
This method will send a ping frame to a specified endpoint (sid) or to all connected sockets with the data as payload.

## close([sid,] [reason])
This method will close the connection to a specified endpoint or if not provided to all connenctions and send a close frame.

## assignSocket(socket [,options])
This method will assign a node socket to the WebSocketBase instance.
After calling this method on a socket the socket can emit events and receive frames.
The optional options parameters defines which extensions should be used.
This method is mostly used internally when binding to a http upgrade.
