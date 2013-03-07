exports.Base = require('./base');
exports.Frame = require('./frame');
exports.Client = require('./client');
exports.Server = require('./server');
exports.Upgrade = require('./upgrade');

// syntactic sugar
exports.createServer = function() {
    return new exports.Server();
};
