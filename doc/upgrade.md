# WebSocket upgrade handler

The upgrade handler is used to request a protocol upgrade from http to ws. It is
usable as standalone component.



## require

```
var websockets = require('websockets');

var upgrade = websockets.upgrade;

var clientUpgrade = upgrade.clientUpgrade; // currently not available
var serverUpgrade = upgrade.serverUpgrade;
var generateHandshake = upgrade.generateHandshake;
var isWebSocketUpgrade = upgrade.isWebSocketUpgrade;
```



## client upgrade

Requests an websocket upgrade from the server. Currently not implemented.



## server upgrade

Handles a websocket upgrade request from the client by sending a valid response.

```
var server = http.createServer();

server.on('upgrade', function(req, socket) {
    serverUpgrade(req, socket, function(socket) {
        // this is an optional callback which is called
        // if there was a successfull websocket upgrade
    });
});

```


## generate handshake

Generates a websocket valid handshake by hashing client key with GUID.

```
var responseHandshake = generateHandshake(req);
```



## is websocket upgrade

Can be used as middleware to check if websocket valid headers a sent in request.
This is used to skip not websocket upgrades.

```
server = http.createServer();

server.on('upgrade', function(req, socket) {
    if (!isWebSocketUpgrade) return;

    // else start upgrade process
});
```



## example

check out test/upgrade_test to see a real example.