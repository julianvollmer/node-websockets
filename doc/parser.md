# WebSocketParser

    Stability: 1 - Experimental; 
    The parser api is really inconsistent and needs a rethink for later.

Access this module with `require('websockets').Parser` or 
`require('websockets').NativeParser`.

There are two versions of this module. The one is written in pure JavaScript
and is highly tested (also in real examples). The other one is written in C++
and loaded as addon. It passed the same tests but was not tested in any
examples. It may also be that the NativeParser is actually slower because of
switching between the environments. But I am not sure about this.

Build the **NativeParser** with `make native` (requires dev deps).

## parser.calcHeadSize(state)

Example:

    // returns six
    parser.calcHeadSize({ mask: true, length: 120 });

Returns the number of bytes the head (non-payload) part of a frame will take.
It is mostly used internally for memory allocation.

## parser.calcHeadSize(chunk)

Example:

    // returns two
    parser.calcHeadSize(new Buffer([0x81, 0x01, 0x68]));

Will read out the first two bytes of a frame in order to calculate the head
byte length.

## parser.readHeadBytes(state, chunk)

Example:

    var state = {};
    parser.readHeadBytes(state, new Buffer([0x82, 0x7d]));
    
    console.log(state.fin); // logs true
    console.log(state.rsv2); // logs false
    console.log(state.mask); // logs false
    console.log(state.opcode); // logs 0x02
    console.log(state.length); // logs 125

Will parse the head bytes and add the parsed flags, values to the `state` hash.

## parser.readBodyBytes(state, chunk);

Example:

    var state = { index: 0, length: 5 };
    var body = parser.readBodyBytes(state, new Buffer('Hello'));

Will return the payload of a frame. If masked it will automatically unmask. It
will only return the pieces of chunk which really belong to the frame the rest
is ignored. In order to know this on a chunked frame it used the `index` 
counter.

## parser.writeHeadBytes(state);

Example:

    var state = { fin: true, mask: false, opcode: 0x02, length: 4 };
    var headBytes = parser.writeHeadBytes(state);
    
    // will log <Buffer 82 04>
    console.log(headBytes);

Turns a `state` hash into frame state.

## parser.writeBodyBytes(state);

Example:

    var state = { index: 0, masking: new Buffer([0x43, 0x3e, 0x0d, 0x78]) }
    var chunk = parser.writeBodyBytes(state);

Will return chunk which is adapted to the frame settings. This means if the
body should be masked it will do this for us.

