// TODO: fragmented masked text frames (do they share a masking)?
// TODO: binary frames
// TODO: reserved opcode frames (for error detection)
// TODO: add head property

var lorem = require('./lorem');

var mockupFrames = {

    // contains "Hello"
    "maskedPingFrame": {
        fin: true, mask: true,
        opcode: 0x09, length: 0x05,
        masking: new Buffer([0x37, 0xfa, 0x21, 0x3d]),
        payload: new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]),
        content: new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
        frame: new Buffer([0x89, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58])
    },

    // contains "Hello"
    "maskedPongFrame": {
        fin: true, mask: true, 
        opcode: 0x0a, length: 0x05,
        masking: new Buffer([0x37, 0xfa, 0x21, 0x3d]),
        payload: new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]),
        content: new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
        frame: new Buffer([0x8a, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58])
    },

    // contains "Hello"
    "maskedCloseFrame": {
        fin: true, mask: true,
        opcode: 0x08, length: 0x05,
        masking: new Buffer([0x37, 0xfa, 0x21, 0x3d]),
        payload: new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]),
        content: new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
        frame: new Buffer([0x88, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]) 
    },

    // contains "Ping, Ping, Ping"
    "unmaskedPingFrame": {
        fin: true, mask: false,
        opcode: 0x09, length: 0x10,
        masking: new Buffer([]),
        payload: new Buffer([0x50, 0x69, 0x6e, 0x67, 0x2c, 0x20, 0x50, 0x69, 0x6e, 0x67, 0x2c, 0x20, 0x50, 0x69, 0x6e, 0x67]),
        content: new Buffer([0x50, 0x69, 0x6e, 0x67, 0x2c, 0x20, 0x50, 0x69, 0x6e, 0x67, 0x2c, 0x20, 0x50, 0x69, 0x6e, 0x67]),
        frame: new Buffer([0x89, 0x10, 0x50, 0x69, 0x6e, 0x67, 0x2c, 0x20, 0x50, 0x69, 0x6e, 0x67, 0x2c, 0x20, 0x50, 0x69, 0x6e, 0x67])
    },

    // contains "Pong, Mong, Song"
    "unmaskedPongFrame": {
        fin: true, mask: false,
        opcode: 0x0a, length: 0x10,
        masking: new Buffer([]),
        payload: new Buffer([0x50, 0x6f, 0x6e, 0x67, 0x2c, 0x20, 0x4d, 0x6f, 0x6e, 0x67, 0x2c, 0x20, 0x53, 0x6f, 0x6e, 0x67]),
        content: new Buffer([0x50, 0x6f, 0x6e, 0x67, 0x2c, 0x20, 0x4d, 0x6f, 0x6e, 0x67, 0x2c, 0x20, 0x53, 0x6f, 0x6e, 0x67]),
        frame: new Buffer([0x8a, 0x10, 0x50, 0x6f, 0x6e, 0x67, 0x2c, 0x20, 0x4d, 0x6f, 0x6e, 0x67, 0x2c, 0x20, 0x53, 0x6f, 0x6e, 0x67])
    },

    // contains "Nice communication but I now want to close"
    "unmaskedCloseFrame": {
        fin: true, mask: false, 
        opcode: 0x08, length: 0x2a,
        masking: new Buffer([]),
        payload: new Buffer([0x4e, 0x69, 0x63, 0x65, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x75, 0x6e, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x62, 0x75, 0x74, 0x20, 0x49, 0x20, 0x6e, 0x6f, 0x77, 0x20, 0x77, 0x61, 0x6e, 0x74, 0x20, 0x74, 0x6f, 0x20, 0x63, 0x6c, 0x6f, 0x73, 0x65]),
        content: new Buffer([0x4e, 0x69, 0x63, 0x65, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x75, 0x6e, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x62, 0x75, 0x74, 0x20, 0x49, 0x20, 0x6e, 0x6f, 0x77, 0x20, 0x77, 0x61, 0x6e, 0x74, 0x20, 0x74, 0x6f, 0x20, 0x63, 0x6c, 0x6f, 0x73, 0x65]),
        frame: new Buffer([0x88, 0x2a, 0x4e, 0x69, 0x63, 0x65, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x75, 0x6e, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x62, 0x75, 0x74, 0x20, 0x49, 0x20, 0x6e, 0x6f, 0x77, 0x20, 0x77, 0x61, 0x6e, 0x74, 0x20, 0x74, 0x6f, 0x20, 0x63, 0x6c, 0x6f, 0x73, 0x65])
    },

    // contains "Hello"
    "singleMaskedTextFrame": {
        fin: true, mask: true,
        opcode: 0x01, length: 0x05,
        masking: new Buffer([0x37, 0xfa, 0x21, 0x3d]),
        payload: new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]),
        content: new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
        frame: new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58])
    },

    // contains lorem ipsum
    "singleUnmaskedTextFrame": {
        fin: true, mask: false,
        opcode: 0x01, length: 0x1ad,
        masking: new Buffer([]),
        payload: new Buffer(lorem),
        content: new Buffer(lorem),
        frame: Buffer.concat([new Buffer([0x81, 0x7e, 0x1, 0xad]), new Buffer(lorem)])
    },

    // contains "Hel"
    "firstFragmentedUnmaskedTextFrame": {
        fin: false, mask: false,
        opcode: 0x01, length: 0x03,
        masking: new Buffer([]),
        payload: new Buffer([0x48, 0x65, 0x6c]),
        content: new Buffer([0x48, 0x65, 0x6c]),
        frame: new Buffer([0x01, 0x03, 0x48, 0x65, 0x6c])
    },

    // contains "lo"
    "secondFragmentedUnmaskedTextFrame": {
        fin: true, mask: false,
        opcode: 0x00, length: 0x02,
        masking: new Buffer([]),
        payload: new Buffer([0x6c, 0x6f]),
        content: new Buffer([0x6c, 0x6f]),
        frame: new Buffer([0x80, 0x02, 0x6c, 0x6f])
    }

};

mockupFrames.each = function(callback) {
    for (var name in this) {
        var container = this[name];
        
        if (typeof container == 'function') return;
        
        callback(name, container);
    }
};

module.exports = mockupFrames;