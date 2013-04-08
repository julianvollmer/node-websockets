# WebSocketIncoming

    Stability: 1 - Experimental;
    I actually do not like to use this (it makes things much more complicated)
    but I do not see any way around in feature.

Access this module with `require('websockets').Socket`

## Class: WebSocketIncoming

This class was introduced because there is no safe way to signal frame ends. It
is only possible to end a whole stream. Because of this the `WebSocketCore`
can pass an instance of `WebSocketIncoming` which represents a streamed frame.
The head information is available through properties and the payload is written
in time.

### new WebSocketIncoming(wscore, [options])

Example:

    var wsincoming = new WebSocketIncoming(wscore);

* `source`, WebSocketCore, (actually not required)    

The constructor does nothing than setting some dummy head flags. `wscore` is
actually meant to directly use `wsincoming.push(buf)` to write the payload. 
But because there will be changes around the bindings to `WebSocketCore` I do
not remove this till later.

### wsincoming.read()

Example:

    wsincoming.read();

Returns current state of payload. 

### wsincoming.push([chunk])

Example:

    wsincoming.push(chunk);

Is currently used by `WebSocketCore` to push body chunk onto the instance.
This actually should not be used directly but I currently see no way around to
signal a end of data than through `wsincoming.push(null)`.

### Event: 'readable'

Emitted when there is some content to read.

### Event: 'end'

Emitted when end of data signal was received **and** all data was read. So you
cannot use `end` to entirely read the whole cache on smaller messages. You have
to cache them manuelly through `readable`.
