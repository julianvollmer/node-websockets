#include "parser.h"

Handle<Value> WriteBodyBytes(const Arguments &args) {
    HandleScope scope;

    Local<Value> stateVal = args[0];
    Local<Value> chunkVal = args[1];

    if (!stateVal->IsObject() || stateVal->IsArray()) {
        ThrowTypeError("Argument one must be a object.");

        scope.Close(Undefined());
    }

    if (!node::Buffer::HasInstance(chunkVal)) {
        ThrowTypeError("Argument two must be a buffer.");

        scope.Close(Undefined());
    }

    Local<Object> stateObj = stateVal->ToObject();
    Local<Object> chunkObj = chunkVal->ToObject();

    Local<Value> maskVal = stateObj->Get(String::New("mask"));
    Local<Value> maskingVal = stateObj->Get(String::New("masking"));
    Local<Value> indexVal = stateObj->Get(String::New("index"));

    if (!maskVal->BooleanValue() || !maskingVal->BooleanValue())
        return scope.Close(chunkObj);

    int index = indexVal->NumberValue();
    int length = node::Buffer::Length(chunkObj);

    byte* chunk = (byte*) node::Buffer::Data(chunkObj);
    byte* masking = (byte*) node::Buffer::Data(maskingVal);
    byte* bodyBytes = (byte*) malloc(length);

    for (int i = 0; i < length; i++)
        bodyBytes[i] = chunk[i] ^ masking[(i + index) % 4];

    return scope.Close(node::Buffer::New((char*) bodyBytes, length)->handle_);
};
