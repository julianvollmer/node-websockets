# WebSocketUpgrade
The WebSocketUpgrade object provides to functions for handling the http websocket upgrade process.

# require
```
var websockets = require('websockets');

websockets.createUpgradeRequest
websockets.handleUpgradeRequest
```

# createUpgradeRequest(url, [options, callback])
This will send a http upgrade request to the specified url.
Options can take an extension array which will be synced with the server.
The response is validated and the callback will contain the socket object and the settings (e.g. synced extensions).

# handleUpgradeRequest(request, socket, [options, callback])
Execute this function in the callback of a http server upgrade event.
You need to provide a request and socket object.
Options can contain an extensions array.
The callback will get a socket object and the settings which where used (e.g. extensions)
