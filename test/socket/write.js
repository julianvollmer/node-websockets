var MockupSocket = require('./msocket');

var WebSocket = require('../../lib/socket');

describe('WebSocket', function() {

    var msocket, wssocket;

    beforeEach(function() {
        msocket = new MockupSocket();
        wssocket = new WebSocket(msocket);
    });

    describe('Writable', function() {
        
        it('should send a stream of frames', function() {
            msocket.on('data', function(chunk) {
                //console.log('read', chunk);
            });
            wssocket.writeHead({ opcode: 0x01 });
            wssocket.write(new Buffer('H'));
            wssocket.write(new Buffer('e'));
            wssocket.write(new Buffer('l'));
            wssocket.write(new Buffer('l'));
            wssocket.writeEnd(new Buffer('o'));
        });

    });

});
