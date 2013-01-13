# WebSocketFrame

The frame prototype is a helper which allows you to build own WebSocket frame
buffers by providing a simple, intuitive api. It is also possible to use the
frame the other way: If you pass the raw frame as buffer to the constructor
you can read out different flags.



## require

The frame object is available through the websockets namespace.
Note: I am not sure if this works with manuel clone..

```
var websockets = require('websockets');

var Frame = websockets.Frame;
```



## usage for building frames

This is how you can use the frame object for building raw websocket frames.

```
var frame = new Frame();

// is this the final frame (default: true)
frame.setFinal(true);

// is this frame masked (default: false)
frame.setMasked(false);

// set the opcode of the frame (default: 0x1 text frame)
frame.setOpcode(0x1);

// set the length (default: uses the length of the payload)
frame.setLength(11);

// set the payload buffer (default: null)
frame.setPayload(new Buffer('hello world'));

// convert the frame to raw buffer
var rawFrame = frame.toBuffer();

// apply the frame to a upgrade handled socket conenction
socket.write(rawFrame);
```



## usage for reading frames

Reading out frames is also quite easy.
Note: decoding a frame with the mask algorithm is currently not implemented
in the frame object itself. You may copy it out of the source if you require.

```
socket.on('data', function(data) {
    var frame = new Frame(data);

    // is this a final frame
    frame.isFinal(); 

    // is this frame masked
    frame.isMasked();

    // what is the opcode
    frame.getOpcode();

    // how much bytes does the payload have
    frame.getLength();

    // what does the masking looks like
    frame.getMasking();

    // give me the payload buffer
    frame.getPayload();
});
```



## further example

Visit test/frame_test.js to see a fully operable example.