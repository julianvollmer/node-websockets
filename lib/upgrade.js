var url = require('url');
var http = require('http');
var crypto = require('crypto');

/**
 * Creates an (client) websocket upgrade request.
 * 
 * This function is used by the WebSocketClient to create and send a WebSocket
 * upgrade request to the server.
 * 
 * @param   {String}    ress
 * @param   {Function}  callback
 */
function createUpgradeRequest(ress, callback) {
    var clientHsk = generateClientHandshake();
    
    var reqOpt = url.parse(ress);
    
    reqOpt.headers = {
        "Origin": "null",
        "Upgrade": "websocket",
        "Connection": "upgrade",
        "Sec-WebSocket-Key": clientHsk,
        "Sec-WebSocket-Version": 13
    };
    
    var request = new http.ClientRequest(reqOpt);
    
    request.once('upgrade', function(res, head, socket) {
        // TODO: throw error on wrong response
        if (res.statusCode != 101) {
            console.log('unexpected status code');
        }
        // TODO: check if response headers are valid
        if (res.headers.upgrade != 'websocket') {
            console.log('upgrade header not websocket');
        }
        if (res.headers.connection != 'upgrade') {
            console.log('connection header not set to upgrade');
        }
        if (res.headers['sec-websocket-accept'] !== generateServerHandshake(clientHsk)) {
            console.log('server handshake is invalid');
        }
        
        if (callback) callback(res, socket);
    });
    
    request.end();
}

/**
 * Handles an (client) websocket upgrade request.
 * 
 * This function is used by the WebSocketServer to handle (analyse) a requested upgrade.
 * 
 * @param   {Request}   req
 * @param   {Socket}    socket
 * @param   {Buffer}    head
 * @param   {Function}  callback
 */
function handleUpgradeRequest(req, socket, callback) {
    var serverHsk = generateServerHandshake(req.headers['sec-websocket-key']);

    var res = new http.ServerResponse(req);

    res.statusCode = 101;
    res.setHeader('Upgrade', 'websocket');
    res.setHeader('Connection', 'upgrade');
    res.setHeader('Sec-WebSocket-Accept', serverHsk);
    res.assignSocket(socket);
    res.end();

    if (callback) callback(socket);
}

/**
 * Generates the random websocket client handshake.
 * 
 * @return  {String}
 */
function generateClientHandshake() {
    return crypto.randomBytes(24).toString('base64');
}

/**
 * Generates the websocket server handshake from the client key.
 * 
 * @param   {String}    clientHsk
 * @return  {String}
 */
function generateServerHandshake(clientHsk) {
    var GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    return crypto.createHash('sha1').update(clientHsk.trim() + GUID).digest('base64');    
}

exports.createUpgradeRequest = createUpgradeRequest;
exports.handleUpgradeRequest = handleUpgradeRequest;
