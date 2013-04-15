#include "parser.h"

Handle<Value> WriteHeadBytes(const Arguments &args) {
    HandleScope scope;

    Local<Object> state = args[0]->ToObject();

    if (!state->IsObject() || state->IsArray()) {
        ThrowTypeError("Argument must be an object.");

        return scope.Close(Undefined());
    }

    bool fin = state->Get(String::New("fin"))
        ->BooleanValue();

    bool mask = state->Get(String::New("mask"))
        ->BooleanValue();

    int opcode = state->Get(String::New("opcode"))
        ->NumberValue();

    int length = state->Get(String::New("length"))
        ->NumberValue();

    Local<Value> maskingValue = state->Get(String::New("masking"));

    int headSize = calcHeadSizeFromObject(state);

    byte* headBytes = (byte*) malloc(headSize);

    for (int i = 0; i < headSize; i++)
        headBytes[i] = 0x00;

    if (length > 125 && length < 0x10000) {
        headBytes[3] = (byte) length;
        headBytes[2] = (byte) (length >> 8);
        length = 126;
    } else if (length > 0xffff) {
        headBytes[9] = (byte) length;
        headBytes[8] = (byte) (length >> 8);
        headBytes[7] = (byte) (length >> 16);
        headBytes[6] = (byte) (length >> 24);
        length = 127;
    }

    headBytes[0] = ((fin) ? 0x80 : 0x00) | opcode;
    headBytes[1] = ((mask) ? 0x80 : 0x00) | length;

    byte* masking = (byte*) malloc(4);

    if (isMasking(maskingValue)) {
        mask = true;
        masking = (byte*) node::Buffer::Data(maskingValue);

        headBytes[1] = headBytes[1] | 0x80;

        for (int i = 0; i < 4; i++)
            headBytes[headSize - 4 + i] = masking[i];
    } else if (mask) {
        srand(time(NULL));
        unsigned int random = rand();
        masking[0] = headBytes[headSize - 1] = (byte) (random);
        masking[1] = headBytes[headSize - 2] = (byte) (random >> 8);
        masking[2] = headBytes[headSize - 3] = (byte) (random >> 16);
        masking[3] = headBytes[headSize - 4] = (byte) (random >> 24);
    }

    state->Set(String::New("mask"), Boolean::New(mask));
    state->Set(String::New("masking"), node::Buffer::New((char*) masking, 4)
            ->handle_);

    return scope.Close(node::Buffer::New((char*) headBytes, headSize)
            ->handle_);
};
