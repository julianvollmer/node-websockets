# WebSocketClient
The WebSocketClient prototype can be used to connect to a WebSocketServer.
It inherits from the WebSocketBase prototype, so check that one out too for get more details over the api.

## new WebSocketClient([options])
Creates an instance of the WebSocketClient.

## open([url])
Will send a http upgrade request to the specified url (or ws://localhost:3000 as default).
