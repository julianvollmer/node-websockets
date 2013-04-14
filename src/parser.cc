#include <v8.h>
#include <node.h>
#include <node_buffer.h>
#include <iostream>

using namespace v8;

Handle<Value> CalcHeadSize(const Arguments &args) {
    HandleScope scope;
    
    Local<Object> obj = args[0]->ToObject();

    if (!node::Buffer::HasInstance(obj)) {
        ThrowException(
                Exception::TypeError(
                    String::New("Argument must be a buffer.")));

        return scope.Close(Undefined());
    }

    if (obj->GetIndexedPropertiesExternalArrayDataLength() < 2) {
        ThrowException(
                Exception::TypeError(
                    String::New("Buffer must be at least two bytes big.")));

        return scope.Close(Undefined());
    }

    unsigned char* data = static_cast<unsigned char*>(obj->GetIndexedPropertiesExternalArrayData());

    unsigned int length = 2;

    if (data[1] & 0x80)
        length += 4;

    switch (data[1] & 0x7f) {
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
    Local<Object> head = args[1]->ToObject();

    if (!state->IsObject()) {
        ThrowException(
                Exception::TypeError(
                    String::New("Argument one must be an object.")));

        return scope.Close(Undefined());
    }

    if (!node::Buffer::HasInstance(head)) {
        ThrowException(
                Exception::TypeError(
                    String::New("Argument two must be a buffer.")));

        return scope.Close(Undefined());
    }

    if (head->GetIndexedPropertiesExternalArrayDataLength() < 2) {
        ThrowException(
                Exception::TypeError(
                    String::New("Buffer must be at least two bytes big.")));

        return scope.Close(Undefined());
    }

    unsigned char* chunk = static_cast<unsigned char*>(
            head->GetIndexedPropertiesExternalArrayData());


    bool fin = !!(chunk[0] & 0x80);
    bool rsv1 = !!(chunk[0] & 0x40);
    bool rsv2 = !!(chunk[0] & 0x20);
    bool rsv3 = !!(chunk[0] & 0x10);
    bool mask = !!(chunk[1] & 0x80);

    int offset = 2;
    int opcode = chunk[0] & 0x0f;
    unsigned long length = chunk[1] & 0x7f;
    
    switch (length) {
        case 126:
            length = chunk[3];
            length += chunk[2] << 8;
            offset += 2;
            break;
        case 127:
            length = chunk[9];
            length += chunk[8] << 8;
            length += chunk[7] << 16;
            length += chunk[6] << 24;
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
            masking[i] = chunk[offset + i];

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

void init(Handle<Object> exports) {
    exports->Set(String::New("calcHeadSize"), 
            FunctionTemplate::New(CalcHeadSize)->GetFunction());

    exports->Set(String::New("readHeadBytes"),
            FunctionTemplate::New(ReadHeadBytes)->GetFunction());
}

NODE_MODULE(parser, init);
