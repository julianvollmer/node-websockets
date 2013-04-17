var crypto = require('crypto');

function calcHeadSize(obj) {
    var size = 2;

    // read from buffer
    if (obj instanceof Buffer) {
        if (obj[1] & 0x80) size += 4;
        switch (obj[1] & 0x7f) {
            case 126:
                size += 2;
                break;
            case 127:
                size += 8;
        }
    } else {
        // read from object
        if (obj.length > 125 && obj.length < 0x10000) 
            size += 2;
        else if (obj.length > 0xffff) 
            size += 8;
        // add masking bytes if mask true
        if (obj.mask || obj.masking && obj.masking.length == 4) 
            size += 4;
    }

    return size;
}

function readHeadBytes(incoming, head) {
    var headSize = incoming._headSize || calcHeadSize(head);
    
    incoming.fin = !!(head[0] & 0x80);
    incoming.mask = !!(head[1] & 0x80);
    incoming.rsv1 = !!(head[0] & 0x40);
    incoming.rsv2 = !!(head[0] & 0x20);
    incoming.rsv3 = !!(head[0] & 0x10);

    incoming.opcode = head[0] & 0x0f;
    incoming.length = head[1] & 0x7f;

    switch (incoming.length) {
        case 126:
            incoming.length = head.readUInt16BE(2);
            break;
        case 127:
            incoming.length = head.readUInt32BE(6);
            incoming.extendedLength = head.readUInt32BE(2);
            break;
    }

    if (incoming.mask)
        incoming.masking = head.slice(headSize - 4, headSize);

    incoming._headSize = headSize;

    return incoming;
}

function readBodyBytes(state, chunk) {
    var index = state._index;
    var length = state.length;

    var payload = chunk.slice(0, length);

    if (state.mask) {
        var masking = state.masking;
        for (var i = 0; i < payload.length; i++)
            payload[i] = payload[i] ^ masking[(i + index) % 4]; 
    }

    state._index += payload.length;

    return payload;
}

// TODO: quit if too big
function writeHeadBytes(state) {
    var opcode = state.opcode;
    var length = state.length;
    var headSize = calcHeadSize(state);

    var headBytes = new Buffer(headSize);
    headBytes.fill(0);

    // first create the length bytes because we have to 
    // know which length we write into the second byte 
    if (length > 125 && length < 0x10000) {
        headBytes.writeUInt16BE(length, 2);
        length = 126;
    } else if (length > 0xffff) {
        headBytes.writeUInt32BE(length, 6);
        length = 127;
    }

    // create the first two bytes (TODO: rsv bits are missing)
    headBytes[0] = ((state.fin) ? 0x80 : 0x00) | opcode;
    headBytes[1] = ((state.mask) ? 0x80 : 0x00) | length;

    // append the masking to the buffer
    if (state.mask || (state.masking && state.masking.length == 4)) {
        state.mask = true;
        var masking = state.masking || crypto.randomBytes(4);
        for (var i = 0; i < 4; i++)
            headBytes[headSize - 4 + i] = masking[i];
        state.masking = masking;
    }

    return headBytes;
}

function writeBodyBytes(state, body) {
    if (!state.mask || !state.masking)
        return body;

    var length = body.length;
    var masked = new Buffer(length);

    for (var i = 0; i < length; i++)
        masked[i] = body[i] ^ state.masking[i % 4];

    return masked;
}

exports.calcHeadSize = calcHeadSize;
exports.readHeadBytes = readHeadBytes;
exports.readBodyBytes = readBodyBytes;
exports.writeHeadBytes = writeHeadBytes;
exports.writeBodyBytes = writeBodyBytes;
