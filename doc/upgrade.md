# WebSocketUpgrade

    Stability: 3 - Stable; 
    There are no changes suggested in feature except some improved options 
    support.

Use `require('websockets').upgrade` to access this module.

## upgrade.createUpgradeRequest(url, [options], [callback])

Example:

    upgrade.createUpgradeRequest('ws://localhost:3000', { extensions: ['x-test'] }, function(err, socket, options) {
        if (err)
            throw err;

        socket.on('data', function(chunk) {
            // will receive websocket frames
        });
        // will output ['x-test'] if extension is supported by both sides
        console.log(options);
    });

* `url`, String, Contains the WebSocket url.
* `options`, Object, Contains options (e.g. Sec-WebSocket headers), Optional.
* `callback`, Function, Executed on response, Optional.

This will send a http upgrade request to the specified `url`. The response is 
validated and the callback will contain the socket object and synced header 
settings like `Sec-WebSocket-Extensions` or `Sec-WebSocket-Protocol`. In case
of an error you need to handle the passed error object. If no error occoured
err will be `null`.

## upgrade.handleUpgradeRequest(request, socket, [options], [callback])

Example:

    var http = require('http');
    var server = http.createServer();

    server.on('upgrade', function(req, socket) {
        if (err)
            throw err;

        upgrade.handleUpgradeRequest(req, socket, { extensions: ['x-test'] }, function(err, options) {
            if (err)
                throw err;

            // will be empty object if client and server do not support same extensions
            console.log(options);
            
            socket.on('data', function(chunk) {

            });
        });
    });

    server.listen(3000);

* `request`, Request, http request instance.
* `socket`, Socket, net socket instance.
* `options`, Object, Contains options (e.g. for headers), Optional.
* `callback`, Function, Contains callback on request validation, Optional.

This function has to be executed in a server upgrade callback. It will parse 
and validate all incoming upgrade requests and will send a upgrade or error 
response to the client. If a handshake went successful it will call the 
supplied callback with passing an `Error` and synced settings (e.g. from both 
side supported extensions).
