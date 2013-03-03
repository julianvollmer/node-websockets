var url = require('url');
var http = require('http');
var crypto = require('crypto');

/**
 * Creates an (client) websocket upgrade request.
 * 
 * This function is used by the WebSocketClient to create and send a WebSocket
 * upgrade request to the server.
 * 
 * @param   {String}    ressource
 * @param   {Object}    options
 * @param   {Function}  callback
 */
function createUpgradeRequest(ressource, options, callback) {
    if (typeof opt == 'function')
        callback = opt;

    var settings = {};
    var clientHsk = generateClientHandshake();
    
    var requestOptions = url.parse(ressource);
    
    requestOptions.headers = {
        "Origin": "null",
        "Upgrade": "websocket",
        "Connection": "Upgrade",
        "Sec-WebSocket-Key": clientHsk,
        "Sec-WebSocket-Version": "13"
    };

    if (options && options.extensions)
        requestOptions.headers['Sec-WebSocket-Extensions'] = options.extensions.join(';');

    var request = new http.ClientRequest(requestOptions);
    
    request.once('upgrade', function(res, socket, head) {
        if (res.headers.hasOwnProperty('sec-websocket-extensions')) {
            var responseExtensions = res.headers['sec-websocket-extensions'].split(';');
            var matches = propertyMatches(responseExtensions, options.extensions);
            if (matches.length > 0)
                settings.extensions = matches;
        }

        if (callback) callback(socket, settings);
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

    var res = new http.ServerResponse(req);
    var returnment = {};

    if (validateRequest(req)) {
        var accept = generateAccept(req.headers['sec-websocket-key']);

        res.statusCode = 101;
        res.setHeader('Upgrade', 'websocket');
        res.setHeader('Connection', 'Upgrade');
        res.setHeader('Sec-WebSocket-Accept', accept);
        res.setHeader('Sec-WebSocket-Version', '13');

        var usesExtensions = req.headers.hasOwnProperty('sec-websocket-extensions');

        if (options && options.extensions && usesExtensions) {
            var available = options.extensions;
            var requested = req.headers['sec-websocket-extensions'].split(' ').join('').split(';');
            var matched = returnment.extensions = propertyMatches(available, requested);
           
            if (matched.length > 0) {           
               res.setHeader('Sec-WebSocket-Extensions', matched.join(';'));
            }
        }
    } else {
        res.statusCode = 400;
        res.write('Invalid headers');
    }

    res.assignSocket(socket);
    res.end();

    if (callback) callback(socket, returnment);
}

/**
 * Returns true if upgrade headers are valid.
 *
 * @param   {ServerRequest}     req
 * @return  {Boolean}
 */
function validateRequest(req) {
    var headers = {};

    for (var key in req.headers) {
        headers[key] = req.headers[key].toLowerCase();
    }

    if (headers['upgrade'] != 'websocket')
        return false;

    if (headers['connection'] != 'upgrade')
        return false;

    if (!headers['sec-websocket-key'])
        return false;

    if (headers['sec-websocket-version'] != 13)
        return false;

    return true;
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
 * Generates the websocket server handshake.
 * 
 * @param   {String}    key
 * @return  {String}
 */
function generateAccept(key) {
    var GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    return crypto.createHash('sha1').update(key.trim() + GUID).digest('base64');    
}

function propertyMatches(source, compare) {
    var matches = [];

    source.forEach(function(key) {
        if (compare.indexOf(key) != -1)
            matches.push(key);
    });

    return matches;
}

exports.createUpgradeRequest = createUpgradeRequest;
exports.handleUpgradeRequest = handleUpgradeRequest;
