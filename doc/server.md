# WebSocketServer

The WebSocketServer prototype is used to create a WebSocket endpoint which
handles the protocol upgrade process and allows listening and sending decoded
messages.



## require

```
var websockets = require('websockets');

var WebSocketServer = websockets.Server;
```


## setup server

To setup a WebSocketServer instance you need to instance it with an url (which
currently does nothing at all..) and register it at the http server by calling
listen.

```
// create instance of a http server
var server = http.createServer();

// create instance of the websocket server
var wss = new WebSocketServer('ws://localhost:3000');

// register upgrade handlers and socket listeners by passing the http server
wss.listen(server);

// keep http server listening on port 3000
server.listen(3000);
```



## listen on events

There are three event functions which are called when a specific event is getting
emitted. These are 'onopen', 'onclose' and 'onmessage'. You can subscribe to them
with an easy overwrite.

```
// create instance of the websocket server
var wss = new WebSocketServer('ws://localhost:3000');

wss.onopen = function(ws) {
    // log that the connection is opened
    console.log('connection opened');

    // send something to the connected client
    ws.send('hi connection established');
};

wss.onmessage = function(message) {
    // message is a string or a buffer depending on the opcode.

    console.log('That was incoming for you: ', message);  
};

wss.onclose = function() {
    console.log('connection closed');  
};
```



## sending something

You can send strings or buffers. They will be sent when the socket is free.
Queuing the sending is on implementation plan.

```
var wss = new WebSocketServer('ws://localhost:3000');

wss.onmessage = function(mess) {
    wss.send('I received your message: ' + mess);
};
```



## code example

To see a real working example checkout test/server_test.js