var util = require('util');

var inherits = util.inherits;

var WebSocketBase = require('./base');
var WebSocketUpgrade = require('./upgrade');

function WebSocketClient(options) {
    options = (options || {});

    options.mask = true;
    options.maxConnections = 1;

    WebSocketBase.call(this, options);
}

inherits(WebSocketClient, WebSocketBase);

WebSocketClient.prototype.open = function(wsurl) {
    var self = this;

    var url = (wsurl || this.url.href);

    var options = { 
        extensions: Object.keys(self.extensions) 
    };

    WebSocketUpgrade.createUpgradeRequest(url, options, function(err, socket, options) {
        if (err)
            self.emit('error', 'upgrade', err);

        self.assignSocket(socket, options);
    });
    
    return this;
};

module.exports = WebSocketClient;
