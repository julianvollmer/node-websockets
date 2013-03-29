module.exports = {

    "x-concat-bubu": {

        read: function(next, wsframe) {
            var content = wsframe.getContent();

            if (wsframe.opcode < 0x03) {
                wsframe.setContent(new Buffer(content.toString() + 'bubu'));
            }

            next(null, wsframe);
        },
        
        write: function(next, wsframe) {
            var content = wsframe.getContent();

            if (wsframe.opcode < 0x03) {
                wsframe.setContent(new Buffer(content.toString() + 'bubu'));
            }

            next(null, wsframe);
        }

    },

    "x-concat-taja": {

        read: function(next, wsframe) {
            var content = wsframe.getContent();

            if (wsframe.opcode < 0x03) {
                wsframe.setContent(new Buffer(content.toString() + 'taja'));
            }

            next(null, wsframe);
        },

        write: function(next, wsframe) {
            var content = wsframe.getContent();
                   
            if (wsframe.opcode < 0x03) {
                wsframe.setContent(new Buffer(content.toString() + 'taja'));
            }

            next(null, wsframe);
        }

    }

};
