#include "parser.h"

Handle<Value> ReadHeadBytes(const Arguments &args) {
    HandleScope scope;
    
    Local<Value> stateVal = args[0];
    Local<Value> chunkVal = args[1];

    if (!stateVal->IsObject()) {
        ThrowTypeError("Argument one must be an object.");

        return scope.Close(Undefined());
    }

    if (!node::Buffer::HasInstance(chunkVal)) {
        ThrowTypeError("Argument two must be a buffer.");

        return scope.Close(Undefined());
    }

    if (node::Buffer::Length(chunkVal) < 2) {
        ThrowTypeError("Buffer must be at least two bytes big.");

        return scope.Close(Undefined());
    }

    byte* head = (byte*) node::Buffer::Data(chunkVal);

    bool fin = !!(head[0] & 0x80);
    bool rsv1 = !!(head[0] & 0x40);
    bool rsv2 = !!(head[0] & 0x20);
    bool rsv3 = !!(head[0] & 0x10);
    bool mask = !!(head[1] & 0x80);

    int offset = 2;
    int opcode = head[0] & 0x0f;
    unsigned long length = head[1] & 0x7f;
    
    switch (length) {
        case 126:
            length = head[3];
            length += head[2] << 8;
            offset += 2;
            break;
        case 127:
            length = head[9];
            length += head[8] << 8;
            length += head[7] << 16;
            length += head[6] << 24;
            offset += 8;
            break;
    }

    if (length > 0xfffffff) {
        ThrowTypeError("Length bigger than UInt32BE.");

        return scope.Close(Undefined());
    }

    Persistent<Object> maskingBuffer;

    byte* masking = (byte*) malloc(4);

    if (mask) {
        for (int i = 0; i < 4; i++)
            masking[i] = head[offset + i];

        maskingBuffer = node::Buffer::New((char*) masking, 4)->handle_;
    } else {
        maskingBuffer = node::Buffer::New(0)->handle_;
    }

    Local<Object> state = stateVal->ToObject();
    
    state->Set(String::New("fin"), Boolean::New(fin));
    state->Set(String::New("rsv1"), Boolean::New(rsv1));
    state->Set(String::New("rsv2"), Boolean::New(rsv2));
    state->Set(String::New("rsv3"), Boolean::New(rsv3));
    state->Set(String::New("mask"), Boolean::New(mask));
    state->Set(String::New("opcode"), Number::New(opcode));
    state->Set(String::New("length"), Number::New(length));
    state->Set(String::New("masking"), maskingBuffer);

    return scope.Close(state);
}
