# WebSocketSocket

    Stability: 2 - Unstable
    
## Class: WebSocketSocket

The WebSocketSocket class wraps around a `Socket` instance and provides WebSocket 
specific method and event support. An instance of it is passed around on all events
of `WebSocketBase` to handle direct endpoint communication.

### new WebSocketSocket(socket, [options])

Example:

    var wssocket = new WebSocketSocket(socket, { mask: true });

* `socket`, Socket, Instance of a node socket (for example from http `upgrade` event)
* `options`, Object, Optional
    * `mask`, Boolean, Determinates if frames should be masked, Default: `false`
    * `timeout`, Number, Time in ms when an idling socket is closed, Default: `600000`
    * `extensions`, Object, Collection of WebSocket extensions added to the parse chain

Will return a new instance of `WebSocketSocket`. In most use-cases there will be no
need to create an instance manuel. An instance is automatically created on upgrade
process and passed to all common events of `WebSocketBase`.

### wssocket.send(message)

Example:

    wssocket.send('Hello World.');
    wssocket.send(new Buffer([0x01, 0x02, 0x03]));

* `message`, String or Buffer

This will send a text frame if argument is a `String` or a binary frame if argument
is a `Buffer` through the socket.

### wssocket.ping([body])

Example:

    wssocket.ping();
    // or
    wssocket.ping('abc');

Will send a ping frame through the socket. On proper implementation a pong frame
should emediatly be sent as response. The pong frame is registered as `pong` event.

### wssocket.close([reason])

Example:
    
    wssocket.close();
    // or
    wssocket.close('session expired');

Will close the socket after a close frame was sent. The close frame may contain
a reason description in payload. This method will trigger a `close` Event.

### Event: 'message'

    function(message) { }

A `message` event is emitted each time a text or binary frame is received.
On text frames the payload is passed as string whereas on binary frames the
payload is passed as a `Buffer`. As you see it can be hard to handle both
binary and text frame over one event so there may be an api change in feature.

### Event: 'custom'

    function(name, [arguments...]) { }

A `custom` event can be used by extensions to tunnel custom events to the parent
class (e.g. `WebSocketBase`). The first parameter is the real event name which
will be emitted on the parent class with the following arguments.

### Event: 'close'

    function(reason) { }

Each time the socket closes a `close` Event is emitted. This can be when receiving
a close frame or when closing the connection with `wssocket.close()`. If the received
close frame contains a payload this will be interpreted as reason and passed as argument.

### Event: 'error'

    function(err) { }

An `error` event is emitted when an error occours. The idea is that you can do you own
error handling (either strict or loose) but until now the `error` event is not supported
through the whole application. Also sometimes the passed `err` is either a `String` or
a `Error` object. Here is a lot to do in feature.

### Event: 'pong'

    function(body) { }

Each time a ping frame is received we will sent a pong frame as response and emit
a `pong` event.
