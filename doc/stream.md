# WebSocketStream

    Stability: 1 - Experimental; 
    There will be no api changes but changes in the behavior of the stream.
    There must be an algorithm to detect invalid frames and some improvements
    around how reads are handled.

    Access this module with `require('websockets').Stream`

## Class: WebSocketStream

The WebSocketStream class inherits from `stream.Duplex`. It wraps an instance 
of `net.Socket` or similar source and will parse all incoming data as WebSocket
frames. The head and payload of each parsed frame is made public through a low-
level api to allow other modules to use them. Same is true for writing
WebSocket frames. Because the stream only parses and sets frames it is not
scheduled to be used on high-level stage.

### new WebSocketStream(source, [options])

Example:

    var wsserver = new WebSocketStream(source, { mask: true });

* `source`, Duplex, preferable a `socket`    
* `options`, Object, option hash
    * `mask`, Boolean, overwrites the default value of `false`
    * `opcode`, Number, `0x01` for utf8 and `0x02` for binary mode

Will bind to the source`s `readable` and `end` event and set up some internal 
flags.

### wsstream.read()

Example:

    wsstream.on('readable', function() {
        console.log(wsstream.read().toString());
    });

`read()` will pull all available body chunk out of `wsstream`. The `readable` 
event tells us when there is chunk to read.

### wsstream.writeHead({ mask: true, opcode: 0x02 })

Example:
    
wsstream.writeHead({ fin: true, mask: true });
wsstream.writeHead({ opcode: 0x02, length: 0x05 });

* `options`, Object
    * `fin`, Boolean, final frame (default: false)
    * `mask`, Boolean, masked frame (default: false or options.mask)
    * `opcode`, Number, frame opcode (default: 0x01)
    * `length`, Number, frame length (default: chunk.length)
    * `masking`, Buffer, masking buffer (default: random)

Sets the head of the frame we are currently writting. NOTE: If you set 
`masking` to a four-byte buffer it will set `mask` automatically to `true`.

### wsserver.write(chunk)

Example:

    wsstream.on('readable', function() {
        wsstream.writeHead({ fin: true, opcode: 0x02 });
        wsstream.write(wsstream.read());
    });

* `chunk`, Buffer, chunk you want to write to socket

The above example pipes all incoming frame bodies to the socket.
When the frame has been fully parsed it will also end the write stream.
This can be useful if you handle large data streams which are chunked by the 
socket.

### Event: 'head'

Example:
    
    wsstream.on('head', function(head) {
        if (head.opcode == 0x02)
            console.log('we are getting some binaries');
            if (head.stream)
                console.log('this is a stream of frames');
        });

The `head` event gives you basic information about what we are receiving but
more than that it tells us when a new frame is incoming.

### Event: 'done'

Is emitted when the stream has fully parsed the payload of a large frame or
when the last part of a frame stream was parsed. It can be used to either pull
out the payload as one piece (useful for small messages) or to unbind from
listeners on streams.

### Event: 'readable'

Is emitted when there is new payload chunk to read.
