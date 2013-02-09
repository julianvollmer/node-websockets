# WebSocketBase
The WebSocketBase prototype is the parent class of client and server.
So it shares the methods of client and server without the directly implementation of the connection mechanism (upgrade).
If you want to build some own custom WebSocket prototype it may be helpful to inherit from this.

## require
The WebSocketBase object is available through the websockets namespace.
```
var websockets = require('websockets');

var WebSocketBase = websockets.Base;
```


## #send(string/buffer)
The send method allows sending data to the other end of the socket.
It will automatically detect the data type (buffer or string) and will create the right frame
for you which it will write to the shared socket object.