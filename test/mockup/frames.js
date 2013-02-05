// TODO: fragmented masked text frames (do they share a masking)?
// TODO: binary frames
// TODO: reserved opcode frames (for error detection)
// TODO: extension frames (?)

var maskedPingFrame = {
    name: "masked ping frame", content: "Hello",
    
    fin: true, mask: true,
    opcode: 0x09, length: 0x05,
    masking: new Buffer([0x37, 0xfa, 0x21, 0x3d]),
    payload: new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]),
    frame: new Buffer([0x89, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58])
};

var maskedPongFrame = {
    name: "masked pong frame", content: "Hello",
    
    fin: true, mask: true, 
    opcode: 0x0a, length: 0x05,
    masking: new Buffer([0x37, 0xfa, 0x21, 0x3d]),
    payload: new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]),
    frame: new Buffer([0x8a, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58])
};

var maskedCloseFrame = {
    name: "masked close frame", content: "Hello",
    
    fin: true, mask: true,
    opcode: 0x08, length: 0x05,
    masking: new Buffer([0x37, 0xfa, 0x21, 0x3d]),
    payload: new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]),    
    frame: new Buffer([0x88, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58]) 
};

var unmaskedPingFrame = {
    name: "unmasked ping frame", content: "Hello",
    
    fin: true, mask: false,
    opcode: 0x09, length: 0x05,
    masking: new Buffer([]),
    payload: new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
    frame: new Buffer([0x89, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f])
};

var unmaskedPongFrame = {
    name: "unmasked pong frame", content: "Hello",
    
    fin: true, mask: false,
    opcode: 0x0a, length: 0x05,
    masking: new Buffer([]),
    payload: new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
    frame: new Buffer([0x8a, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f])
};

var unmaskedCloseFrame = {
    name: "unmasked close frame", content: "Hello",
    
    fin: true, mask: false, 
    opcode: 0x08, length: 0x05,
    masking: new Buffer([]),
    payload: new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
    frame: new Buffer([0x88, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f])
};

var singleMaskedTextFrame = {
    name: "single masked text frame", content: "Hello",
    
    fin: true, mask: true,
    opcode: 0x01, length: 0x05,
    masking: new Buffer([0x37, 0xfa, 0x21, 0x3d]),
    payload: new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]),
    frame: new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58])
};

var singleUnmaskedTextFrame = {
    name: "single unmasked text frame", content: "Hello",
    
    fin: true, mask: false,
    opcode: 0x01, length: 0x05,
    masking: new Buffer([]),
    payload: new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
    frame: new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f])
};

var firstFragmentedUnmaskedTextFrame = {
    name: "first fragmented unmasked text frame", content: "Hel",
    
    fin: false, mask: false,
    opcode: 0x01, length: 0x03,
    masking: new Buffer([]),
    payload: new Buffer([0x48, 0x65, 0x6c]),
    frame: new Buffer([0x01, 0x03, 0x48, 0x65, 0x6c])
};

var secondFragmentedUnmaskedTextFrame = {
    name: "second fragmented unmasked text frame", content: "lo",
    
    fin: true, mask: false,
    opcode: 0x00, length: 0x02,
    masking: new Buffer([]),
    payload: new Buffer([0x6c, 0x6f]),
    frame: new Buffer([0x80, 0x02, 0x6c, 0x6f])
};

var allFrames = [
    maskedPingFrame, unmaskedPingFrame,
    maskedPongFrame, unmaskedPongFrame,
    maskedCloseFrame, unmaskedCloseFrame,
    singleMaskedTextFrame, singleUnmaskedTextFrame,
    firstFragmentedUnmaskedTextFrame, secondFragmentedUnmaskedTextFrame
];

exports.allFrames = allFrames;
exports.maskedPingFrame = maskedPingFrame;
exports.maskedPongFrame = maskedPongFrame;
exports.maskedCloseFrame = maskedCloseFrame;
exports.unmaskedPingFrame = unmaskedPingFrame;
exports.unmaskedPongFrame = unmaskedPongFrame;
exports.unmaskedCloseFrame = unmaskedCloseFrame;

exports.singleMaskedTextFrame = singleMaskedTextFrame;
exports.singleUnmaskedTextFrame = singleUnmaskedTextFrame;
exports.firstFragmentedUnmaskedTextFrame = firstFragmentedUnmaskedTextFrame;
exports.secondFragmentedUnmaskedTextFrame = secondFragmentedUnmaskedTextFrame;