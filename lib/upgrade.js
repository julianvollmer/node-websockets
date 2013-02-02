var url     = require('url');
var http    = require('http');
var crypto  = require('crypto');

/**
 * Client upgrade handler.
 *
 * @param   {Object}   ressource
 * @param   {Object}   extensions
 * @param   {Function} callback
 */
function clientUpgrade(ressource, extensions, callback) {
    var options = url.parse(ressource);
    
    var clientKey = generateClientKey();
    
    options.headers = {
        "Origin": null,
        "Upgrade": "websocket",
        "Connection": "upgrade",
        "Sec-WebSocket-Key": clientKey,
        "Sec-WebSocket-Version": 13
    };

    if (arrayToHeader(extensions)) {
        options.headers['Sec-WebSocket-Extensions'] = arrayToHeader(extensions);
    }
    
    var req = new http.ClientRequest(options);
    
    req.once('upgrade', function(res, socket, head) {        
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
        if (res.headers['sec-websocket-accept'] != generateHandshake(clientKey)) {
            console.log('server handshake is invalid');
        }

        console.log('response headers:', res.headers);

        var options = {};

        if (res.headers['sec-websocket-extensions']) {
            options.extensions = res.headers['sec-websocket-extensions'].split(';');
        }
        
        if (callback) callback(socket, options);
    });
    
    req.end();
}

/**
 * Server upgrade handler.
 *
 * @param   {Request}   req
 * @param   {Socket}    socket
 * @param   {Buffer}    head
 * @param   {Array}     extens
 * @param   {Function}  callback
 */
function serverUpgrade(req, socket, head, extens, callback) {
    if (!isWebSocketUpgrade) return;
    
    var handshake = generateHandshake(req.headers['sec-websocket-key']);
    var extensions = syncExtensions(req.headers['sec-websocket-extensions'], extens);

    var res = new http.ServerResponse(req);

    res.statusCode = 101;
    res.setHeader('Upgrade', 'websocket');
    res.setHeader('Connection', 'upgrade');
    res.setHeader('Sec-WebSocket-Accept', handshake);
    
    if (arrayToHeader(extensions)) {
        // exts are sent but not accepted by chrome
        res.setHeader('Sec-WebSocket-Extensions', arrayToHeader(extensions));
    }

    res.assignSocket(socket);
    res.end();

    if (callback) callback(socket, { extensions: extensions });
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
 * Returns an array of extensions which are supported by client and server.
 *
 * @param   {Array}     header
 * @param   {Object}    extensions
 * @return  {String}
 */
function syncExtensions(header, extensions) {
    if (!header) return;

    if (header.indexOf(';') != -1) {
        header = header.split(';');
    }

    // TODO: rename vars
    var resHeader = ''
    var syncedExts = [];
    var header = [].concat(header);

    for (var i = 0; i < header.length; i++) {
        var ext = header[i];

        extensions.forEach(function(name) {
            if (name === ext) {
                syncedExts.push(ext);
            } 
        });
    }

    return syncedExts;
}

function arrayToHeader(arr) {
    if (arr.length === 0) return null;

    var header = '';

    arr.forEach(function(item, index) {
        if (index + 1 == arr.length) {
            header += item;
        } else {
            header += item + ';'; 
        }
    });

    return header;
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