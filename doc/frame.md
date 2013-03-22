# WebSocketFrame

    Stability: 2 - Unstable; Can be that we split the WebSocketFrame down to IncomingFrame 
    and OutgoingFrame and/or the support of concating fragmented frame payloads together.

Use `require('websockets').Frame` to access this module.

## Class: WebSocketFrame

The WebSocketFrame class is used to provide a readable, easy-to-use api
on modifing WebSocket binary frame buffers. Normally you will not get in
contact with this class but if you want to write extensions it is likely
to require knowledge about this class in order to handle your payload.

### new WebSocketFrame([chunk])

Example:

    var wsframe = new WebSocketFrame();
    // or with wrapping some binary frame
    var wsframe = new WebSocketFrame(chunk);

* `chunk`, Buffer, Optional, WebSocketFrame to wrap or map.

The constructor creates a new instance of the WebSocketFrame prototype.
It will either set some default frame parameters or map the provided chunk.

### wsframe.fin

Example:

    wsframe.fin = true;

`fin` lets you read and set the fin flag of a frame. It defaults to `true`.

### wsframe.rsv1

Example:

    if (wsframe.rsv1)
        throw new Error('reserved flag should not be set');

`rsv1`, `rsv2` and `rsv3` properties default to `false`. They are used
internally for validation and should be avoided to be used even RFC 6455
and `WebSocketSocket` generally allow modification.

### wsframe.mask

Example:

    wsframe.mask = true;

`mask` contains a `Boolean` and determinates if the message should be masked
or is masked. Per standard client frames should be masked whereas server frames
should be unmasked.

### wsframe.glued

`glued` contains a `Boolean` which determinates if the chunk is actually a collection
of glued together WebSocket frames. `glued` is read-only and will not have any affect
on encoding the frame.

### wsframe.opcode

Example:

    if (wsframe.opcode == 0x01)
        console.log('text frame with payload:', wsframe.content.toString());

`opcode` contains a `Number` which represents the frame type.
Currently there are `0x00` (fragment), `0x01` (string), `0x02` (binary), `0x08` (close),
`0x09` (ping) and `0x0a` (pong). Other opcodes are reserved in RFC 6455. The standard
allows using reserved opcodes on extensions but I personally would not recommend this.

### wsframe.length

`length` contains the payload length as `Number`.

### wsframe.frameLength

`frameLength` contains the total length of the whole frame as `Number`.

### wsframe.masking

If `wsframe.mask` is set to `true` this will contain four random bytes else `null`.

### wsframe.payload

Contains the raw unmasked payload as `Buffer` with size of `wsframe.length`.

### wsframe.content

Example:

    // will return the message as string
    wsframe.content.toString();

Contains the unmasked payload as `Buffer`.

### wsframe.remnant

If `wsframe.glued` is `true` the frame contains more bytes than defined in the
frame header. In this case the overlapping bytes are cut and written to `wsframe.remnant`
in order to be reparsed if they where just glued together else it is set to `null`.

### wsframe.get(key)

Example:

    var masked = wsframe.get('mask');
    var content = wsframe.get('content');

* `key`, String, Contains the property name.

This method is only an alternative to accessing direclty the properties for those who prefer getters.

### wsframe.set(key, value)

Example:

    wsframe.set('fin', true);
    wsframe.set('content', new Buffer('Hello.'));

Alternative to setting properties directly.

### wsframe.mapFrame(chunk)

Example:

    socket.on('data', function(chunk) {
            wsframe.mapFrame(chunk);
    });

Maps a binary encoded frame to the object (is actually called by the constructor).

### wsframe.toBuffer()

Example:

    wsframe.set('fin', true);
    wsframe.set('mask', false);
    wsframe.set('opcode', 0x01);
    wsframe.set('content', new Buffer('Hi'));
    // will return <Buffer 0x81 0x02 0x48 0x69>
    wsframe.toBuffer();

Returns the wsframe object encoded as WebSocket frame buffer.

### wsframe.isValid()

Example:

    wsframe.set('rsv1', true);
    // will return false
    wsframe.isValid();

Returns `true` if wsframe properties match the WebSocket standard.
*Note*: This method will not work on some extensions and does not cover
all requirements of the standard.
