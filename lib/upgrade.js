var url = require('url');
var http = require('http');
var crypto = require('crypto');

var parse = url.parse;

var ClientRequest = http.ClientRequest;

function createUpgradeRequest(url, options, callback) {
    options = (options || {});
    
    if (2 == arguments.length)
        callback = options;

    if (options.extensions)
        var exts = options.extensions.join(';');
    
    var key = generateKey();
    var req = new ClientRequest(parse(url));
    
    req.setHeader('Origin', url);
    req.setHeader('Upgrade', 'websocket');
    req.setHeader('Connection', 'Upgrade');
    req.setHeader('Sec-WebSocket-Key', key);
    req.setHeader('Sec-WebSocket-Version', '13');
    req.setHeader('Sec-WebSocket-Extensions', exts);
    req.once('upgrade', parseResponse);
    req.once('error', handleError);
    req.end();

    function parseResponse(res, socket, head) {
        var err = validateUpgradeResponse(res, key);

        var extensionHeader = res.headers['sec-websocket-extensions'];
        if (extensionHeader) {
            // TODO: use regex for trim
            var matches = propertyMatches(extensionHeader.split(' ').join('').split(';'), options.extensions);
            if (0 < matches.length)
                options.extensions = matches;
        }
        if (callback) callback(err, socket, options);
    }

    function handleError(error) {
        if (callback) callback(error);
    }
}

function handleUpgradeRequest(req, socket, options, callback) {
    options = (options || {});
    
    if ('function' == typeof options)
        callback = options;

    var res = new http.ServerResponse(req);
    var err = validateUpgradeRequest(req);
    var key = req.headers['sec-websocket-key'];
    var extens = req.headers['sec-websocket-extensions'];

    if (!err) {
        res.statusCode = 101;
        res.setHeader('Upgrade', 'websocket');
        res.setHeader('Connection', 'Upgrade');
        res.setHeader('Sec-WebSocket-Accept', generateAccept(key));
        res.setHeader('Sec-WebSocket-Version', '13');
        
        if (options.extensions && extens) {
            // TODO: use regex for trim
            var matched = propertyMatches(options.extensions, extens.split(' ').join('').split(';'));
           
            if (0 < matched.length)         
               res.setHeader('Sec-WebSocket-Extensions', matched.join(';'));
            
            options.extensions = matched;
        }
    } else {
        res.statusCode = 400;
        res.write('Invalid headers.');
    }

    res.assignSocket(socket);
    res.end();

    if (callback) callback(err, options);
}

function generateKey() {
    return crypto.randomBytes(24).toString('base64');
}

function generateAccept(key) {
    var GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    return crypto.createHash('sha1').update(key.trim() + GUID).digest('base64');
}

function validateUpgradeRequest(req) {
    var headers = req.headers;
    if ('websocket' != headers['upgrade'])
        return new Error('Invalid upgrade header in upgrade request.');
    if ('Upgrade' != headers['connection'])
        return new Error('Invalid connection header.');
    if (!headers['sec-websocket-key'])
        return new Error('Invalid sec-websocket-key header in upgrade request.');
    if (13 != headers['sec-websocket-version'])
        return new Error('Invalid sec-websocket-version header in upgrade request.');

    return null;
}

function validateUpgradeResponse(res, key) {
    if ('websocket' != res.headers['upgrade'])
        return new Error('Invalid upgrade header in upgrade response.');
    if ('Upgrade' != res.headers['connection'])
        return new Error('Invalid connection header in upgrade response.');
    if (generateAccept(key) != res.headers['sec-websocket-accept'])
        return new Error('Invalid sec-websocket-accept header in upgrade respone.');

    return null;
}

function propertyMatches(source, compare) {
    var matches = source.filter(function(val) {
        return compare.indexOf(val) != -1;
    });

    return matches;
}

exports.createUpgradeRequest = createUpgradeRequest;
exports.handleUpgradeRequest = handleUpgradeRequest;
