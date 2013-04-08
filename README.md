# node-websockets

a simple implementation of the websocket protocol (RFC 6455) which is totally 
built stream based in order to take advantage of nodejs async behavior

## Snippet

```
// greet the connected client and broadcast that
// we have a new client connected
wsserver.on('open', function(wssocket) {
    wssocket.send('Hello new Client ' + wssocket.id);
    wsserver.broadcast('New Client ' + wssocket.id + ' has connected!');
});

// broadcast that a client has left
wsserver.on('close', function(wssocket) {
    wsserver.broadcast('Client ' + wssocket.id + ' has left us.');
});

// broadcast around messages which are incoming
wsserver.on('message', function(message, wssocket) {
    wsserver.broadcast(wssocket.id ' says: ' + message);
});

// share streamed images around all clients
wsserver.on('stream:start', function(wssocket) {
    wssocket.pipe(wsserver);
});

// remove stream listeners
wsserver.on('stream:end', function(wssocket) {
    wssocket.unpipe(wsserver);
});

// bind to http server
wsserver.listen(server);
```

## Full Example

View a [simple chat server]
(https://github.com/bodokaiser/node-websockets/blob/master/example/chat/server.js)
which allows connected browsers to send small text messages or to send images
by using the HTML5 File API (move an image into the input field).

## Documentation

### Installation

Use npm for installation.

Example:

    npm install websockets

### Modules

Access following modules through `websockets` namespace:

* [WebSocketServer]
(https://github.com/bodokaiser/node-websockets/blob/master/doc/socket.md)
handles multiple WebSocket connections providing a high-level api
* [WebSocketUpgrade]
(https://github.com/bodokaiser/node-websockets/blob/master/doc/upgrade.md)
handles http upgrade process for WebSockets
* [WebSocketSocket]
(https://github.com/bodokaiser/node-websockets/blob/master/doc/server.md)
handles a single WebSocket connection by reading and writing frames
* [WebSocketCore]
(https://github.com/bodokaiser/node-websockets/blob/master/doc/core.md)
core stream layer which parses and writes WebSocket frames

## License (MIT)

Copyright 2013 Bodo Kaiser <bodo.kaiser@enabre.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
