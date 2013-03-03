# WebSocketFrame
The frame prototype is a helper which allows you to build own WebSocket frames by providing a simple, intuitive property-based api. 
It is also possible to use the WebSocketFrame the other way: You can pass the raw frame as buffer to the constructor and can read out different attributes.

## require
The frame object is available through the websockets namespace.
```
var websockets = require('websockets');

var WebSocketFrame = websockets.Frame;
```



## usage for building frames
This is how you can use the frame object for building raw websocket frames.

```
var frame = new WebSocketFrame();

// set fin flag (default: true)
frame.fin = true;

// set mask flag (default: false)
frame.mask = false;

// set opcode (default: 0x01 text frame)
frame.opcode = 0x01;

// set length (default: zero)
frame.length = 0x05;

// set payload (default: empty buffer)
frame.payload = new Buffer('Hello');

// transform the object to buffer and write it to socket
socket.write(frame.toBuffer());
```



## usage for reading frames
Reading out frames is also quite easy.
```
socket.on('data', function(data) {
    var frame = new WebSocketFrame(data);

    // fin flag
    frame.fin; 

    // mask flag
    frame.mask;

    // opcode
    frame.opcode;

    // length
    frame.length;

    // masking (if not masked undefined)
    frame.masking;

    // unmasked payload buffer
    frame.payload;
});
```


## #mapFrame(rawFrame)
Maps a websocket buffer onto the object (is used in the constructor).



## #isValid()
Returns true if frame is valid that means is conform to the standard RFC 6455.
