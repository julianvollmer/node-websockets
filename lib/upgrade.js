var url = require('url');
var http = require('http');
var crypto = require('crypto');

var parse = url.parse;

var ClientRequest = http.ClientRequest;

function createUpgradeRequest(url, options, callback) {
    options = (options || {});
    
    if (arguments.length == 2)
        callback = options;

    if (options.extensions)
        var exts = options.extensions.join(';');
    
    var key = generateKey();
    var req = new ClientRequest(parse(url))
    
    req.setHeader('Origin', url)
    req.setHeader('Upgrade', 'websocket')
    req.setHeader('Connection', 'Upgrade')
    req.setHeader('Sec-WebSocket-Key', key)
    req.setHeader('Sec-WebSocket-Version', '13')
    req.setHeader('Sec-WebSocket-Extensions', exts)
    req.once('upgrade', parseResponse)
    req.end();

    function parseResponse(res, socket, head) {
        if (!validateUpgradeResponse(res, key))
            var error = 'Upgrade Response is Invalid.';

        var extensionHeader = res.headers['sec-websocket-extensions'];
        if (extensionHeader) {
            var matches = propertyMatches(extensionHeader.split(' ').join('').split(';'), options.extensions);
            if (matches.length > 0)
                options.extensions = matches;
        }
        // TODO: should pass error
        if (callback) callback(socket, options);
    }
}

function handleUpgradeRequest(req, socket, options, callback) {
    options = (options || {});
    
    if (typeof options == 'function')
        callback = options;

    var res = new http.ServerResponse(req);
    var key = req.headers['sec-websocket-key'];
    var extens = req.headers['sec-websocket-extensions'];

    if (validateUpgradeRequest(req)) {
        res.statusCode = 101;
        res.setHeader('Upgrade', 'websocket');
        res.setHeader('Connection', 'Upgrade');
        res.setHeader('Sec-WebSocket-Accept', generateAccept(key));
        res.setHeader('Sec-WebSocket-Version', '13');
        
        if (options.extensions && extens) {
            var matched = propertyMatches(options.extensions, extens.split(' ').join('').split(';'));
           
            if (matched.length > 0)         
               res.setHeader('Sec-WebSocket-Extensions', matched.join(';'));
            
            options.extensions = matched;
        }
    } else {
        res.statusCode = 400;
        res.write('Invalid headers.');
    }

    res.assignSocket(socket);
    res.end();

    // TODO: should pass error as first argument
    if (callback) callback(socket, options);
}

function generateKey() {
    return crypto.randomBytes(24).toString('base64');
}

function generateAccept(key) {
    var GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    return crypto.createHash('sha1').update(key.trim() + GUID).digest('base64');
}

// TODO: should return error message which header is wrong
function validateUpgradeRequest(req) {
    var headers = req.headers;
    if (headers['upgrade'] != 'websocket')
        return false;
    if (headers['connection'] != 'Upgrade')
        return false;
    if (!headers['sec-websocket-key'])
        return false;
    if (headers['sec-websocket-version'] != 13)
        return false;

    return true;
}

// TODO: same as above
function validateUpgradeResponse(res, key) {
    if (res.headers['upgrade'] != 'websocket')
        return false;
    if (res.headers['connection'] != 'Upgrade')
        return false;
    if (res.headers['sec-websocket-accept'] != generateAccept(key))
        return false;

    return true;
}

function propertyMatches(source, compare) {
    var matches = source.filter(function(val) {
        return compare.indexOf(val) != -1;
    });

    return matches;
}

exports.createUpgradeRequest = createUpgradeRequest;
exports.handleUpgradeRequest = handleUpgradeRequest;
