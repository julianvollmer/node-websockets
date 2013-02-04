// single unmasked text frame
var unmaskedTextFrame = new Buffer(7);
unmaskedTextFrame[0] = 0x81;
unmaskedTextFrame[1] = 0x05;
unmaskedTextFrame[2] = 0x48;
unmaskedTextFrame[3] = 0x65;
unmaskedTextFrame[4] = 0x6c;
unmaskedTextFrame[5] = 0x6c;
unmaskedTextFrame[6] = 0x6f;

// single masked text frame
var maskedTextFrame = new Buffer(11); 
maskedTextFrame[0] = 0x81;
maskedTextFrame[1] = 0x85;
maskedTextFrame[2] = 0x37;
maskedTextFrame[3] = 0xfa;
maskedTextFrame[4] = 0x21;
maskedTextFrame[5] = 0x3d;
maskedTextFrame[6] = 0x7f;
maskedTextFrame[7] = 0x9f;
maskedTextFrame[8] = 0x4d;
maskedTextFrame[9] = 0x51;
maskedTextFrame[10] = 0x58;

// single unmasked close frame (unconfirmed)
var unmaskedCloseFrame = new Buffer(7);
unmaskedCloseFrame[0] = 0x88;
unmaskedCloseFrame[1] = 0x05;
unmaskedCloseFrame[2] = 0x48;
unmaskedCloseFrame[3] = 0x65;
unmaskedCloseFrame[4] = 0x6c;
unmaskedCloseFrame[5] = 0x6c;
unmaskedCloseFrame[6] = 0x6f;

// single unmasked ping frame
var unmaskedPingFrame = new Buffer(7);
unmaskedPingFrame[0] = 0x89;
unmaskedPingFrame[1] = 0x05;
unmaskedPingFrame[2] = 0x48;
unmaskedPingFrame[3] = 0x65;
unmaskedPingFrame[4] = 0x6c;
unmaskedPingFrame[5] = 0x6c;
unmaskedPingFrame[6] = 0x6f;

// single masked pong frame
var maskedPongFrame = new Buffer(11);
maskedPongFrame[0] = 0x8a;
maskedPongFrame[1] = 0x85;
maskedPongFrame[2] = 0x37;
maskedPongFrame[3] = 0xfa;
maskedPongFrame[4] = 0x21;
maskedPongFrame[5] = 0x3d;
maskedPongFrame[6] = 0x7f;
maskedPongFrame[7] = 0x9f;
maskedPongFrame[8] = 0x4d;
maskedPongFrame[9] = 0x51;
maskedPongFrame[10] = 0x58;

exports.maskedTextFrame = maskedTextFrame;
exports.unmaskedTextFrame = unmaskedTextFrame;
exports.unmaskedPingFrame = unmaskedPingFrame;
exports.maskedPongFrame = maskedPongFrame;