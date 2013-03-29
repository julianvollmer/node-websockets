# WebSocketFrame

    Stability: 3 - Stable;

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

### wsframe.opcode

Example:

    if (wsframe.opcode == 0x01) {
        console.log('text frame with payload:', wsframe.getContent().toString());
    }

`opcode` contains a `Number` which represents the frame type.
Currently there are `0x00` (fragment), `0x01` (string), `0x02` (binary), `0x08` (close),
`0x09` (ping) and `0x0a` (pong). Other opcodes are reserved in RFC 6455. The standard
allows using reserved opcodes on extensions but I personally would not recommend this.

### wsframe.length

`length` contains the payload length as `Number`.

### wsframe.masking

If `wsframe.mask` is set to `true` this will contain four random bytes else an empty `Buffer.

### wsframe.payload

Contains the raw payload as `Buffer` with size of `wsframe.length` (can be masked).

### wsframe.remnant

If `wsframe.glued` is `true` the frame contains more bytes than defined in the
frame header. In this case the overlapping bytes are cut and written to `wsframe.remnant`
in order to be reparsed if they where just glued together else it is set to `null`.

### wsframe.addFragment(fragframe);

* `fragframe`, WebSocketFrame, WebSocketFrame instance of a fragmented frame.

Example:

    fragframe = new WebSocketFrame(new Buffer([0x00, 0x01, 0x6f]));
    wsframe.addFragment(fragframe);

To improve handling of fragmented frames you can use `wsframe.addFragment` to 
add fragmented frames which then will be threated as one frame when using `wsframe.getContent()`.

### wsframe.getContent()

Example:

    wsframe.getContent();

Returns a `Buffer` which contains the actual data of the frame - the unmasked payload.
If you have used `wsframe.addFragment` than `wsframe.getContent()` will return all payloads
concated together.

### wsframe.setContent(buf)

* `buf`, Buffer, a `Buffer` containing the data you want to set to the frame.

Example:

    wsframe.setContent(new Buffer('Hello'));

Sets the payload to `buf`. If `wsframe.mask` is `true` and there is no masking key
it will create one and immediatly mask the payload and update the `wsframe.length`.

### wsframe.toBuffer()

Example:

    wsframe.fin = true;
    wsframe.mask = false;
    wsframe.opcode = 0x01;
    wsframe.setContent(new Buffer('Hi'));
    // will return <Buffer 0x81 0x02 0x48 0x69>
    wsframe.toBuffer();

Returns the wsframe object encoded as WebSocket frame.

### wsframe.isValid()

Example:

    wsframe.rsv1 = true;
    // will return false
    wsframe.isValid();

Returns `true` if wsframe properties match the WebSocket standard.
*Note*: This method will not work on some extensions and does not cover
all requirements of the standard.

### wsframe.validate()

Example:

    if (!wsframe.isValid()) {
        throw wsframe.validate();
    }

Will return an `Error` object with the validation message.
