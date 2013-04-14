#include <v8.h>
#include <node.h>
#include <node_buffer.h>
#include <iostream>

using namespace v8;

typedef unsigned char byte;

Handle<Value> CalcHeadSize(const Arguments &args) {
    HandleScope scope;
    
    Local<Object> chunk = args[0]->ToObject();

    if (!node::Buffer::HasInstance(chunk)) {
        ThrowException(
                Exception::TypeError(
                    String::New("Argument must be a buffer.")));

        return scope.Close(Undefined());
    }

    if (node::Buffer::Length(chunk) < 2) {
        ThrowException(
                Exception::TypeError(
                    String::New("Buffer must be at least two bytes big.")));

        return scope.Close(Undefined());
    }

    int length = 2;
    byte* head = (byte*) node::Buffer::Data(chunk);

    if (head[1] & 0x80)
        length += 4;

    switch (head[1] & 0x7f) {
        case 126:
            length += 2;
            break;
        case 127:
            length += 8;
            break;
    }

    return scope.Close(Number::New(length));
}

Handle<Value> ReadHeadBytes(const Arguments &args) {
    HandleScope scope;
    
    Local<Object> state = args[0]->ToObject();
    Local<Object> chunk = args[1]->ToObject();

    if (!state->IsObject()) {
        ThrowException(
                Exception::TypeError(
                    String::New("Argument one must be an object.")));

        return scope.Close(Undefined());
    }

    if (!node::Buffer::HasInstance(chunk)) {
        ThrowException(
                Exception::TypeError(
                    String::New("Argument two must be a buffer.")));

        return scope.Close(Undefined());
    }

    if (node::Buffer::Length(chunk) < 2) {
        ThrowException(
                Exception::TypeError(
                    String::New("Buffer must be at least two bytes big.")));

        return scope.Close(Undefined());
    }

    byte* head = (byte*) node::Buffer::Data(chunk);

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
        ThrowException(
                Exception::TypeError(
                    String::New("Length bigger than UInt32BE.")));

        return scope.Close(Undefined());
    }

    Persistent<Object> maskingBuffer;

    char masking[4];
    if (mask) {
        for (int i = 0; i < 4; i++)
            masking[i] = head[offset + i];

        maskingBuffer = node::Buffer::New(masking, 4)->handle_;
    } else {
        maskingBuffer = node::Buffer::New(0)->handle_;
    }

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

Handle<Value> ReadBodyBytes(const Arguments &args) {
    HandleScope scope;
    
    Local<Object> state = args[0]->ToObject();
    Local<Object> chunk = args[1]->ToObject();

    if (!state->IsObject() || state->IsArray()) {
        ThrowException(
            Exception::TypeError(
                String::New("Argument one must be an object.")));

        return scope.Close(Undefined());
    }

    if (!state->Has(String::New("index"))) {
        ThrowException(
            Exception::TypeError(
                String::New("Argument one must have property index.")));

        return scope.Close(Undefined());
    }

    if (!state->Has(String::New("length"))) {
        ThrowException(
            Exception::TypeError(
                String::New("Argument one must have property length.")));

        return scope.Close(Undefined());
    }

    if (!node::Buffer::HasInstance(chunk)) {
        ThrowException(
            Exception::TypeError(
                String::New("Argument two must be a buffer.")));

        return scope.Close(Undefined());
    }

    int index = state->Get(String::New("index"))
        ->NumberValue();
    
    int length = state->Get(String::New("length"))
        ->NumberValue();

    byte* buf = (byte*) node::Buffer::Data(chunk);

    return scope.Close(Undefined());
}

void init(Handle<Object> exports) {
    exports->Set(String::New("calcHeadSize"), 
            FunctionTemplate::New(CalcHeadSize)->GetFunction());

    exports->Set(String::New("readHeadBytes"),
            FunctionTemplate::New(ReadHeadBytes)->GetFunction());

    exports->Set(String::New("readBodyBytes"),
            FunctionTemplate::New(ReadBodyBytes)->GetFunction());
}

NODE_MODULE(parser, init);
