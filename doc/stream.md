# WebSocketStream

    Stability: 2 - Unstable; 
    The feature of the WebSocketStream is not quite sure. We definetly need a
    socket wrapper which knows when a frame starts and end but how we publish
    these stats to the outside and how we take write operations is not good
    yet. So there will be some redesign in this direction. Also we need a
    better fitting name and some error detection.

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

* `source`, Duplex, preferable a `socket`.    
* `options`, Object, options hash.
    * `mask`, Boolean, overwrites the default value of `false`.
    * `opcode`, Number, `0x01` for utf8 and `0x02` for binary mode.
    * `useRequest`, Boolean, See `request` event.

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

Sets the head of the frame we are currently writting. If you set `masking` to a 
four-byte buffer it will set `mask` automatically to `true`. **Note:** If you
have called `writeHead()` it will immediately write the head bytes to the
socket so you will have no chance of changing them when called.

### wsstream.write(chunk)

Example:

    // start writing a big frame
    wsstream.writeHead({ fin: true, opcode: 0x02, length: 0x09 });
    wsstream.write(new Buffer([0x01, 0x02, 0x03, 0x04]));
    wsstream.write(new Buffer([0x05, 0x06, 0x07, 0x08, 0x09]));

* `chunk`, Buffer, chunk you want to write to socket.

Writes `chunk` to the payload of a frame. If you want `write()` to add chunk to
the same frame then you **must** define its length in the head else it will be
send as a new frame with some default head settings.

### Event: 'request'

Example:
    
    wsstream.on('request', function(request) {
        if (request.opcode == 0x09) {
            wsstream.once('done', function() {
                var payload = wsstream.read() || new Buffer(0);

                wsstream.writeHead({ fin: true, opcode: 0x0a });
                wsstream.write(payload);
            });
        }
    });

The `request` event is emitted when the head of a new frame has been parsed. It 
is used to add opcode specific frame handling on top of the WebSocketStream by 
setting up listeners to the `readable` event. If `useRequest` flag is `true` 
the event will not pass an object hash but an instance of `WebSocketIncoming`.
The benefit on using `WebSocketIncoming` is that all payload is written on 
`WebSocketIncoming` and that a frame end is signaled by an `end` event which is
currently the only safe way to detect stream ends.

### Event: 'done'

Is emitted when the stream has fully parsed the payload of a large frame or
when the last part of a frame stream was parsed. It can be used to either pull
out the payload as one piece (useful for small messages) or to unbind from
listeners on streams. Note: If you have set `useRequest` then there this event
will not be emitted.

### Event: 'readable'

Is emitted when there is new payload chunk to read.
