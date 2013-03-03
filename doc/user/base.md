# WebSocketBase
The WebSocketBase prototype shares the API of WebSocketServer and WebSocketClient.
It can be used for custom WebSocketServer implementations.

## new WebSocketBase([options])
Creates a new instance of the WebSocketBase.

## event: "open"
An open event is emitted each time a new socket is assigned.
It contains the connected sid as parameter.

## event: "pong"
A pong event is always emitted when a pong frame is send (e.g. after a ping request).
It contains the sid and the ping payload as callback parameter.

## event: "close"
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
