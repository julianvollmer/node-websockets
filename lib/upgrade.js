var url     = require('url');
var http    = require('http');
var crypto  = require('crypto');

/**
 * Client upgrade handler.
 *
 * @param   {Request}   req
 */
function clientUpgrade(ressource, callback) {
    var options = url.parse(ressource);
    
    options.method = 'GET';
    options.upgrade = 'websocket';
    options.connection = 'upgrade';
    options['sec-websocket-key'] = generateClientKey();
    options['sec-websocket-version'] = 13;
    
    var req = http.request(options, function(res) {
        if (res.statusCode != 101) {
            console.log('error');
        }
        
        console.log(res.headers);
        
        console.log(res.socket);
        
        if (callback) callback(res.socket);
    });
    
    req.end();
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
    
    var handshake = generateHandshake(req.headers['sec-websocket-key']);

    var res = new http.ServerResponse(req);

    res.statusCode = 101;

    res.setHeader('Upgrade', 'websocket');
    res.setHeader('Connection', 'upgrade');
    res.setHeader('Sec-WebSocket-Accept', handshake);

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
 * Generates a client WebSocket key. 
 *
 * @return  {String}
 */
function generateClientKey() {
    return crypto.randomBytes(24).toString('base64');   
}

/**
 * Generates a WebSocket handshake key.
 *
 * @param   {Request}   req
 * @return  {String}
 */
function generateHandshake(clientKey) {
    var GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    
    var serverKey = clientKey.trim() + GUID;

    return crypto.createHash('sha1').update(serverKey).digest('base64');
}

exports.clientUpgrade       = clientUpgrade;
exports.serverUpgrade       = serverUpgrade;
exports.generateHandshake   = generateHandshake;
exports.isWebSocketUpgrade  = isWebSocketUpgrade;