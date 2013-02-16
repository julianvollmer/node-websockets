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
function createUpgradeRequest(ress, options, callback) {
    if (typeof options == 'function') {
        callback = options;
    }

    var clientHsk = generateClientHandshake();
    
    var requestOptions = url.parse(ress);
    
    requestOptions.headers = {
        "Origin": "null",
        "Upgrade": "websocket",
        "Connection": "upgrade",
        "Sec-WebSocket-Key": clientHsk,
        "Sec-WebSocket-Version": "13"
    };

    if (options && options.hasOwnProperty('extensions')) {
        var extensions = options.extensions[0];

        requestOptions.headers['Sec-WebSocket-Extensions'] = extensions;
    }

    var request = new http.ClientRequest(requestOptions);
    
    request.once('upgrade', function(res, head, socket) {
        /*
        if (res.statusCode != 101) return;
        if (res.headers.upgrade != 'websocket') return;
        if (res.headers.connection != 'upgrade') return;
        if (res.headers['sec-websocket-accept'] !== generateServerHandshake(clientHsk)) return;
        */
        
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
function handleUpgradeRequest(req, socket, options, callback) {
    if (typeof options == 'function')
        callback = options;

    var serverHsk = generateServerHandshake(req.headers['sec-websocket-key']);

    var res = new http.ServerResponse(req);

    res.statusCode = 101;
    res.setHeader('Upgrade', 'websocket');
    res.setHeader('Connection', 'upgrade');
    res.setHeader('Sec-WebSocket-Accept', serverHsk);

    if (options && options.hasOwnProperty('extensions')) {
       var extensions = options.extensions[0];
       
	   res.setHeader('Sec-WebSocket-Extensions', extensions);
    }

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
