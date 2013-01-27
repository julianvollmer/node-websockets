# websockets

simple websocket server implementation for nodejs

TODOs:

* official WebSocket status codes
* buffer frames which get split by highWaterMark in socket stream
* queue send calls if there is no connection
* allow different websocket instances for different urls
* add some better tests
* handle connection errors
* validate websocket frames
* allow sending data with continuation frames
* implement secured version of protocol "wss"
* add JsDocs to all modules
* refactor WebSocketFrame object
* add new abstraction layer which uses obj notation to define frames (similar to options in http.ClientRequest)

by bodo kaiser