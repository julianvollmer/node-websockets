var http        = require('http');
var crypto      = require('crypto');
var websockets  = require('./index');

var ServerResponse  = http.ServerResponse;
var createHash      = crypto.createHash;
var server          = websockets.server;

/**
 * Upgraded event handler.
 *
 * @param   {ServerRequest}     req
 * @param   {Socket}            socket
 * @param   {Buffer}            head
 */
module.exports = function(req, socket, head) {
    var res = new ServerResponse(req);

    res.statusCode = 101;

    res.setHeader('Upgrade', 'websocket');
    res.setHeader('Connection', 'upgrade');
    res.setHeader('Sec-WebSocket-Accept', generateKey(req));

    res.assignSocket(socket);

    res.end();

    server.emit('upgraded', socket, head);
};


var GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/**
 * Generates a WebSocket handshake key.
 *
 * @param   {ServerRequest}     req
 * @return  {String}
 */
function generateKey(req) {
    var clientKey = req.headers['sec-websocket-key'];

    var serverKey = clientKey.trim() + GUID;

    return crypto.createHash('sha1').update(serverKey).digest('base64');
}