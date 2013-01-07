var crypto  = require('crypto');

function Frame() {
    this.last = null;
    this.mask = null;
    this.masked = null;
    this.opcode = null;
    this.length = null;
    this.payload = null;
}

module.exports = Frame;