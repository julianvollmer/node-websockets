# node-websockets

a simple, fundamental implementation of the websocket protocol (RFC 6455) which
is built stream based in order to take advantage of nodejs async event loop.

*NOTE*: There will be a lot of changes going on the next few days for example
I will code a `WebSocketRequest` and `WebSocketResponse` object to simplify
writing frame streams. Also you can very easily pipe incoming data around.

## Snippet

```
var util = require('util');
var http = require('http');
var websockets = require('websockets');

// create http server
var server = http.createServer();

// create websocket server
var wsserver = new websockets.Server();

// send hello when someone connects
wsserver.on('open', function(wssocket) {
    wssocket.writeHead({ fin: true, opcode: 0x01 }));
    wssocket.write(new Buffer('Hello new Client ' + wssocket.id));
    wsserver.broadcast({ fin: true, opcode: 0x01 }, 'New Client has connected!');
});

// log the received message
wsserver.on('message', function(message, wssocket) {
    wsserver.broadcast(
        { fin: true, opcode: 0x01 },
        util.format('Client #%d says: %s', wssocket.index, message)
    );
});

// bind to http server
wsserver.listen(server);

// bind http server to port 3000
server.listen(3000);
```

## Documentation

### Installation

Use npm for installation.

Example:

    npm install websockets

### Modules

Access following modules through `websockets` namespace:

* `WebSocketFrame` reads and writes WebSocket binary frames
* `WebSocketSocket` handles a single WebSocket connection
* `WebSocketUpgrade` handles a WebSocket http upgrade process
* `WebSocketBase` base high-level api class for WebSockets
* `WebSocketClient` high-level api class for WebSocket clients
* `WebSocketServer` high-level api class for WebSocket servers

Example:

    var websockets = require('websockets');
    var WebSocketBase = websockets.Base;
    var WebSocketClient = websockets.Client;

## Further documentation

Further documentation is splitted into user and developer level.
User level contains high-level api for endusers and developer level 
contains api for internal modules.

User level:

* [WebSocketBase](https://github.com/bodokaiser/node-websockets/blob/master/doc/base.md)
* [WebSocketClient](https://github.com/bodokaiser/node-websockets/blob/master/doc/client.md) 
* [WebSocketServer](https://github.com/bodokaiser/node-websockets/blob/master/doc/server.md)

Developer level:

* [WebSocketFrame](https://github.com/bodokaiser/node-websockets/blob/master/doc/frame.md)
* [WebSocketSocket](https://github.com/bodokaiser/node-websockets/blob/master/doc/socket.md)
* [WebSocketUpgrade](https://github.com/bodokaiser/node-websockets/blob/master/doc/upgrade.md)

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
