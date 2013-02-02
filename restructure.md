this file is used as note for restructering ideas

main issues:
1. seperation between socket and stream class is unnecessary and makes things harder
2. the use of a frame object with mapping is quite unflexibel
3. with supporting extensions the logic about the upgrade process is grown to heavy
4. node's native stream class is currently very shitty (especially the duplex)
5. bad support for extensibility, sharing options (e.g. the way we handle extensions in socket)

sub issues:
1. there are methods where there shouldn't be ones (e.g. _ping, _pong)
2. unflexibel helper methods
3. messy code


main solutions:
1. New architecture
2. Direct parsing of incoming frames
3. Helper for creating headers
4. Own Duplex Stream class which really works duplex ('read', 'write' events)
5. Lets see how we can handle this 

sub solutions:
1. direct implementation when parsing
2. new helper methods
3. refactor methods
4. keep payload untouched

new architecture:
1. WebSocketFrame and WebSocketStream are merged to WebSocketStream:

main task of the new WebSocketStream class is to extract the payload data of a 
websocket frame and to convert some payload to a websocket frame by side it
should handle control frames and the whole connection state

- socket -> stream -> payload -> 'data' event
- payload -> write -> stream -> socket
- direct parsing of frames
- direct handling of control frames


2. WebSocket is extended to WebSocketBase

the WebSocketBase class contains logic which is overlapping between
the WebSocketServer and the WebSocketClient

- extension parsing
- io methods
- connection management



questions, problems, todos:
- how do we set WebSocketStream to client or server?
- how do we keep the WebSocketStream readable?
- how can we make a good transition between upgrade and base?
- how much do we use parser helper methods?
- how does the duplex stream class look like or do we still should stick to the standard?
- how does the api of the header helper look like?
- how do we keep abstraction to reading, writing websocket frames without having the issue of the frame object?