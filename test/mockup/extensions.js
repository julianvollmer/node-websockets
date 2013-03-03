module.exports = {

    "x-concat-bubu": {

        read: function(next, wsf) {
            if (wsf.opcode < 0x03)
                wsf.content = new Buffer(wsf.content + 'bubu');

            next(null, wsf);
        },
        
        write: function(next, wsf) {
            if (wsf.opcode < 0x03)
                wsf.content = new Buffer(wsf.content + 'bubu');

            next(null, wsf);
        }

    },

    "x-concat-taja": {

        read: function(next, wsf) {
            if (wsf.opcode < 0x03)
                wsf.content = new Buffer(wsf.content + 'taja');

            next(null, wsf);
        },

        write: function(next, wsf) {
            if (wsf.opcode < 0x03)
                wsf.content = new Buffer(wsf.content + 'taja');

            next(null, wsf);
        }

    }

};
