# node-websockets
a simple, fundamental implementation of the websocket protocol which supports easy extension handling

## snippet
'''
var http = require('http');
var websockets = require('websockets');

// create http server
var server = http.createServer();

// create websocket server
var wss = new websockets.Server();

// send hello when someone connects
wss.on('open', function() {
    wss.send('hello');
});

// log the received message
wss.on('message', function(message) {
    console.log(message);
});

// bind to http server
wss.listen(server);

// bind http server to port 3000
server.listen(3000);
'''

## license (MIT)
Copyright 2013 Bodo Kaiser <bodo.kaiser@enabre.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
