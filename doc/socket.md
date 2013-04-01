# WebSocket

    Stability: 1 - Experimental; 
    There will be changes in the internal architecture
    and in the behavior of some methods in the future.

Access this module with `require('websockets').Socket`

## Class: WebSocket

The WebSocket class inherits from `stream.Duplex`.
It wraps an instance of `net.Socket` or similar source and will
parse on each `readable` event of the source the incoming data
as WebSocket frame. You also can write data to the stream which
is written to a WebSocketFrame and sent through the source.

### new WebSocket(source, [options])

Example:

    var wsserver = new WebSocket(source, { mask: true });

* `source`, Duplex, preferable a `socket`    
* `options`, Object, option hash
    * `mask`, Boolean, overwrites the default value of `false`

Will bind to the source`s `readable` and `end` event and set
up some internal flags, instances.

### wssocket.read()

Example:

    wssocket.on('readable', function() {
        console.log(wssocket.read().toString());
    });

`read()` will pull all available body chunk out of `wssocket`.
The `readable` event tells us when there is chunk to read.

### wssocket.writeHead({ mask: true, opcode: 0x02 })

Example:
    
    wssocket.writeHead({ fin: true, mask: true });
    wssocket.writeHead({ opcode: 0x02, length: 0x05 });

* `head`, Object
    * `fin`, Boolean, final frame (default: false)
    * `mask`, Boolean, masked frame (default: false or options.mask)
    * `opcode`, Number, frame opcode (default: 0x01)
    * `length`, Number, frame length (default: chunk.length)
    * `masking`, Buffer, masking buffer (default: randomBytes)

Sets the head of the frame we are currently writting.

### wsserver.writeEnd(chunk)

Example:

    wssocket.writeHead({ opcode: 0x01 });
    wssocket.writeEnd(new Buffer('Hello'));

* `chunk`, Buffer, chunk you want to write to socket

Will write a final frame to the source. This is useful when you want to end 
a stream of fragmented frame (which is used by `wssocket.write()` or just
write a simple single frame.

### wsserver.write(chunk)

Example:

    wssocket.writeHead({ opcode: 0x02 });
    wssocket.on('readable', function() {
        wssocket.write(wssocket.read());
    });
    wssocket.on('done', function() {
        wssocket.write(wssocket.writeEnd());
    });

* `chunk`, Buffer, chunk you want to write to socket

The above example pipes all incoming frame bodies to the socket.
When the frame has been fully parsed it will also end the write stream.
This can be useful if you handle large data streams which are chunked by the 
socket.

### Event: 'head'

Example:
    
    wssocket.on('head', function(head) {
        if (head.opcode == 0x09)
            console.log('the upcoming frame is a ping');
    });

Is emitted after all head bytes where parsed. It will pass a `head` hash
which contains the `fin`, `mask`, `rsv1`, `rsv2`, `rsv3`, `opcode`, `length`,
`masking` and some less important parsing information like `headSize`.

### Event: 'done'

Is emitted when the stream has fully parsed the payload of a final frame.

### Event: 'readable'

Is emitted when there is new payload chunk to read.
