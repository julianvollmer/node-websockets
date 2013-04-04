# WebSocket

    Stability: 1 - Experimental; 
    There will be changes in the internal architecture and in the behavior of 
    some methods in the future (especially around the reading part).

Access this module with `require('websockets').Socket`

## Class: WebSocket

The WebSocket class inherits from `stream.Duplex`. It wraps an instance of 
`net.Socket` or similar source and will parse all incoming data on each 
`readable` event of the source. You also can write data to the stream which
is decoded as WebSocketFrame and sent through the source.

### new WebSocket(source, [options])

Example:

    var wsserver = new WebSocket(source, { mask: true });

* `source`, Duplex, preferable a `socket`    
* `options`, Object, option hash
    * `mask`, Boolean, overwrites the default value of `false`
    * `opcode`, Number, `0x01` for utf8 and `0x02` for binary mode

Will bind to the source`s `readable` and `end` event and set
up some internal flags, instances.

### wssocket.read()

Example:

    wssocket.on('readable', function() {
        console.log(wssocket.read().toString());
    });

`read()` will pull all available body chunk out of `wssocket`. The `readable` 
event tells us when there is chunk to read.

### wssocket.setOpcode(0x02)

Example:
    
    wssocket.setOpcode(0x02);
    wssocket.writeEnd(new Buffer([0xfa, 0xce]));

This method allows you changing the opcode.

### wssocket.ping([chunk])

Example:

    wssocket.ping();
    wssocket.ping(new Buffer('How fast are u?'));

Sends a `ping` frame through the socket. If the endpoint answers proberly with
a `pong` frame a `pong` event with the origin body will be emitted.

### wssocket.close([code])

Example:

    wssocket.close();
    wssocket.close(1001);

Will send a `close` frame to the endpoint which may contain a status code.

### wsserver.writeEnd([chunk])

Example:

    wssocket.writeEnd(new Buffer('Hello'));

* `chunk`, Buffer, chunk you want to write to socket

Will write a final frame to the source. This is useful when you want to end 
a stream of fragmented frame (which is used by `wssocket.write()` or just
write a simple single frame.

### wsserver.write(chunk)

Example:

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
        if (head.opcode == 0x02)
            console.log('we are getting some binaries');
        if (head.stream)
            console.log('this is a stream of frames');
    });

The `head` event gives you basic information about what we are receiving but
more than that it tells us when a new data frame is incoming.

### Event: 'done'

Is emitted when the stream has fully parsed the payload of a final frame.

### Event: 'readable'

Is emitted when there is new payload chunk to read.
