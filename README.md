# websockets

simple websocket server implementation for nodejs

TODOs:

* wire up streams which transform data
* allow (un)masking data directly in frame
* implement client websocket
* queue send calls if there is no connection
* allow websockets to be used event or/and url based
* detect and parse json strings (extension?)
* add some better tests
* handle connection errors
* validate websocket frames
* allow sending data with continuation frames
* implement secured version of protocol "wss"
* test if length paring/generation of lengths above 125 work
* refactor stream interface to match actually stream pattern
* add JsDocs to all modules

by bodo kaiser