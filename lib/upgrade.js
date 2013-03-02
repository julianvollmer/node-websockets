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
 * @param   {Object}    opt
 * @param   {Function}  callback
 */
function createUpgradeRequest(ressource, opt, callback) {
    if (typeof opt == 'function') {
        callback = opt;
    }

    var clientHsk = generateClientHandshake();
    
    var requestOptions = url.parse(ressource);
    
    requestOptions.headers = {
        "Origin": "null",
        "Upgrade": "websocket",
        "Connection": "upgrade",
        "Sec-WebSocket-Key": clientHsk,
        "Sec-WebSocket-Version": "13"
    };

    if (opt && opt.hasOwnProperty('extensions')) {
        var keys = [];

        opt.extensions.forEach(function(exten) {
            keys.push(exten.name);
        });

        if (keys.length != 0) {
            requestOptions.headers['Sec-WebSocket-Extensions'] = keys.join(';');
        }
    }

    var request = new http.ClientRequest(requestOptions);
    
    request.once('upgrade', function(res, socket, head) {
        /*
        if (res.statusCode != 101) return;
        if (res.headers.upgrade != 'websocket') return;
        if (res.headers.connection != 'upgrade') return;
        if (res.headers['sec-websocket-accept'] !== generateServerHandshake(clientHsk)) return;
        */
        if (res.headers.hasOwnProperty('sec-websocket-extensions')) {
            res.headers['sec-websocket-extensions'].split(';').forEach(function(resExten) {
                opt.extensions.forEach(function(reqExten) {
                    if (resExten.name == reqExten.name) {
                        reqExten.enabled = true;
                    }
                });
            });
        }

        if (callback) callback(res, socket, keys);
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

    //if (validateRequest(req)) {
    if (true) {
        var accept = generateAccept(req.headers['sec-websocket-key']);

        res.statusCode = 101;
        res.setHeader('Upgrade', 'websocket');
        res.setHeader('Connection', 'upgrade');
        res.setHeader('Sec-WebSocket-Accept', accept);

        if (options && options.hasOwnProperty('extensions') && req.headers.hasOwnProperty('sec-websocket-extensions')) {
            var extens = options.extensions;
            var reqExtens = req.headers['sec-websocket-extensions'].split(';');
            var resExtens = [];

            extens.forEach(function(exten) {
                reqExtens.forEach(function(reqExten) {
                    if (exten.name == reqExten) {
                        exten.enabled = true;
                        resExtens.push(reqExten);
                    }
                });        
            });
           
           res.setHeader('Sec-WebSocket-Extensions', resExtens.join(';'));
        }
    } else {
        res.statusCode = 400;
        res.write('Invalid headers');
    }

    res.assignSocket(socket);
    res.end();

    if (callback) callback(socket, resExtens);
}

/**
 * Returns true if upgrade headers are valid.
 *
 * @param   {ServerRequest}     req
 * @return  {Boolean}
 */
function validateRequest(req) {
    var headers = req.headers;

    for (var key in headers) {
        headers[key] = headers[key].toLowerCase();
    }

    if (req.headers['upgrade'] != 'websocket')
        return false;

    if (req.headers['connection'] != 'upgrade')
        return false;

    if (!req.headers['sec-websocket-key'])
        return false;

    if (req.headers['sec-websocket-version'] != 13)
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

exports.createUpgradeRequest = createUpgradeRequest;
exports.handleUpgradeRequest = handleUpgradeRequest;
