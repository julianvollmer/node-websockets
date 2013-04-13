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
                    String::New("Buffer must be at least two byts big.")));

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

/*
Handle<Value> ReadHeadBytes(const Arguments &args) {
    HandleScope scope;
    
    Local<Object> state = args[0];
    Local<Object> head = args[0]->ToObject();

    if (!state->IsObject()) {
        ThrowException(
                Exception::TypeError(
                    String::New("Argument must be a buffer.")));

        return scope.Close(Undefined());
    }

    if (obj->GetIndexedPropertiesExternalArrayDataType() == kExternalByteArray) {
        ThrowException(
                Exception::TypeError(
                    String::New("Argument must be a buffer.")));

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
}*/

void init(Handle<Object> exports) {
    exports->Set(String::New("calcHeadSize"), 
            FunctionTemplate::New(CalcHeadSize)->GetFunction());
}

NODE_MODULE(parser, init);
