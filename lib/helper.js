/**
 * Checks if flag is set in byte.
 *
 * @param   {Number}    byte
 * @param   {Number}    flag
 * @return  {Boolean}
 */
exports.isFlagSet = function(byte, flag) {

    return (byte & flag) == flag;  
};

exports.getFourBits = function(byte) {

    return (byte & 0xF);
};