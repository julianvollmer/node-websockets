var http    = require('http');
var crypto  = require('crypto');

/**
 * Client upgrade handler.
 *
 * @param   {Request}   req
 */
function clientUpgrade(req, res) {
    // has to get implemented
}

/**
 * Server upgrade handler.
 *
 * @param   {Request}   req
 * @param   {Socket}    socket
 * @param   {Buffer}    head
 * @param   {Function}  callback
 */
function serverUpgrade(req, socket, head, callback) {
    if (!isWebSocketUpgrade) return;

    var res = new http.ServerResponse(req);

    res.statusCode = 101;

    res.setHeader('Upgrade', 'websocket');
    res.setHeader('Connection', 'upgrade');
    res.setHeader('Sec-WebSocket-Accept', generateHandshake(req));

    res.assignSocket(socket);

    res.end();

    if (callback) callback(socket);
}

/**
 * Checks if upgrade is actually a websocket one.
 *
 * TODO: do more checks (version, etc.)
 *
 * @param   {Request}   req
 * @return  {Boolean}
 */
function isWebSocketUpgrade(req) {
    if (req.method != 'GET') return false;
    if (req.headers.upgrade != 'websocket') return false;

    return true;
}

/**
 * Generates a WebSocket handshake key.
 *
 * @param   {Request}   req
 * @return  {String}
 */
function generateHandshake(req) {
    var GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    var clientKey = req.headers['sec-websocket-key'];
    
    var serverKey = clientKey.trim() + GUID;

    return crypto.createHash('sha1').update(serverKey).digest('base64');
}

exports.clientUpgrade       = clientUpgrade;
exports.serverUpgrade       = serverUpgrade;
exports.generateHandshake   = generateHandshake;
exports.isWebSocketUpgrade  = isWebSocketUpgrade;