#include "parser.h"

Handle<Value> ReadHeadBytes(const Arguments &args) {
    HandleScope scope;
    
    Local<Value> chunk = args[1];

    if (!args[0]->IsObject() || args[0]->IsArray()) {
        ThrowTypeError("Argument one must be an object.");

        return scope.Close(Undefined());
    }

    if (!node::Buffer::HasInstance(chunk)) {
        ThrowTypeError("Argument two must be a buffer.");

        return scope.Close(Undefined());
    }

    if (node::Buffer::Length(chunk) < 2) {
        ThrowTypeError("Buffer must be at least two bytes big.");

        return scope.Close(Undefined());
    }

    frame_head_t* frame_head = (frame_head_t*) malloc(sizeof(frame_head_t));

    read_head_bytes(frame_head, (bytes_t*) node::Buffer::Data(chunk));

    if (frame_head->length > 0xfffffff) {
        ThrowTypeError("Length bigger than UInt32BE.");

        return scope.Close(Undefined());
    }
    
    Local<Object> state = args[0]->ToObject();

    state->Set(String::New("fin"), Boolean::New(frame_head->fin));
    state->Set(String::New("rsv1"), Boolean::New(frame_head->rsv1));
    state->Set(String::New("rsv2"), Boolean::New(frame_head->rsv2));
    state->Set(String::New("rsv3"), Boolean::New(frame_head->rsv3));
    state->Set(String::New("mask"), Boolean::New(frame_head->mask));
    state->Set(String::New("opcode"), Number::New(frame_head->opcode));
    state->Set(String::New("length"), Number::New(frame_head->length));
    
    if (frame_head->mask)
        state->Set(String::New("masking"), 
                node::Buffer::New((char*) frame_head->masking, 4)->handle_);

    return scope.Close(state);
};

int read_head_bytes(frame_head_t* frame_head,  bytes_t* head_bytes) {

    frame_head->fin = !!(head_bytes[0] & 0x80);
    frame_head->rsv1 = !!(head_bytes[0] & 0x40);
    frame_head->rsv2 = !!(head_bytes[0] & 0x20);
    frame_head->rsv3 = !!(head_bytes[0] & 0x10);
    frame_head->mask = !!(head_bytes[1] & 0x80);

    frame_head->opcode = head_bytes[0] & 0x0f;
    frame_head->length = head_bytes[1] & 0x7f;

    int offset = 2;
    
    switch (frame_head->length) {
        case 126:
            frame_head->length = head_bytes[3];
            frame_head->length += head_bytes[2] << 8;
            offset += 2;
            break;
        case 127:
            frame_head->length = head_bytes[9];
            frame_head->length += head_bytes[8] << 8;
            frame_head->length += head_bytes[7] << 16;
            frame_head->length += head_bytes[6] << 24;
            offset += 8;
            break;
    }
    
    if (frame_head->mask) {
        for (int i = 0; i < 4; i++)
            frame_head->masking[i] = head_bytes[offset + i];
    }

    return 0;
};
