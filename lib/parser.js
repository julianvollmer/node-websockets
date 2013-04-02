var crypto = require('crypto');

function calcHeadSize(obj) {
    var size = 2;

    if (obj instanceof Buffer) {
        if (obj[1] & 0x80)
            size += 4;

        switch (obj[1] & 0x07f) {
            case 126:
                size += 2;
                break;
            case 127:
                size += 8;
        }
    } else {
        if (obj.length > 125 && obj.length < 0x10000)
            size += 2;
        else if (obj.length > 0xffff)
            size += 8;
        if (obj.mask || obj.masking && obj.masking.length === 4)
            size += 4;
    }

    return size;
}

function readHeadBytes(state, chunk) {
    var headSize = calcHeadSize(chunk);
    
    state.fin = !!(chunk[0] & 0x80);
    state.mask = !!(chunk[1] & 0x80);
    state.rsv1 = !!(chunk[0] & 0x40);
    state.rsv2 = !!(chunk[0] & 0x20);
    state.rsv3 = !!(chunk[0] & 0x10);

    state.opcode = chunk[0] & 0x0f;
    state.length = chunk[1] & 0x7f;

    switch (state.length) {
        case 126:
            state.length = chunk.readUInt16BE(2);
            break;
        // TODO: quit connection if too big
        case 127:
            state.length = chunk.readUInt32BE(6);
            break;
    }

    if (state.mask)
        state.masking = chunk.slice(headSize - 4, headSize);

    state.headSize = headSize;

    return state;
}

function writeHeadBytes(state, chunk) {
    var headBytes;
    
    if (chunk)
        state.length = chunk.length;

    var opcode = state.opcode;
    var length = state.length;
    var headSize = calcHeadSize(state);

    headBytes = new Buffer(headSize);
    headBytes.fill(0);

    if (length > 125 && length < 0x10000) {
        headBytes.writeUInt16BE(length, 2);
        length = 126;
    } else if (length > 0xffff) {
        headBytes.writeUInt32BE(length, 6);
        length = 127;
    }

    headBytes[0] = ((state.fin) ? 0x80 : 0x00) | opcode;
    headBytes[1] = ((state.mask) ? 0x80 : 0x00) | length;

    // TODO: put the below together (the if case only sets masking)
    // and use a for loop to write the bytes
 
    if (state.mask || (state.masking && state.masking.length == 4)) {
        var masking = state.masking || crypto.randomBytes(4);
        for (var i = 0; i < 4; i++)
            headBytes[headSize - 4 + i] = masking[i];
    }

    return headBytes;
}

exports.calcHeadSize = calcHeadSize;
exports.readHeadBytes = readHeadBytes;
exports.writeHeadBytes = writeHeadBytes;
