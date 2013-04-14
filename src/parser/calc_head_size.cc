#include "parser.h"

Handle<Value> CalcHeadSize(const Arguments &args) {
    HandleScope scope;

    if (!args[0]->IsObject() || args[0]->IsArray()) {
        ThrowTypeError("Argument must be either object or buffer.");

        return scope.Close(Undefined());
    }

    Local<Object> object = args[0]->ToObject();

    if (node::Buffer::HasInstance(object)) {
        if (node::Buffer::Length(object) < 2) {
            ThrowTypeError("Buffer must have at least two bytes.");

            return scope.Close(Undefined());
        }
        
        return scope.Close(Number::New(calcHeadSizeFromBuffer(object)));
    }

    if (object->IsObject()) {
        if (!object->Has(String::New("length"))) {
            ThrowTypeError("State must have property length.");

            return scope.Close(Undefined());
        }

        return scope.Close(Number::New(calcHeadSizeFromObject(object)));
    }

    return scope.Close(Undefined());
};

bool isMasking(Local<Value> value) {
    if (value->IsUndefined())
        return false;
   
    Local<Object> masking = value->ToObject();

    if (!node::Buffer::HasInstance(masking))
        return false;

    if (node::Buffer::Length(masking) != 4)
        return false;

    return true;
};

int calcHeadSizeFromObject(Local<Object> state) {
    int size = 2;

    bool mask = state->Get(String::New("mask"))
        ->BooleanValue();

    int length = state->Get(String::New("length"))
        ->NumberValue();

    Local<Value> masking = state->Get(String::New("masking"));

    if (length > 125 && length < 0x10000)
        size += 2;
    else if (length > 0xffff)
        size += 8;

    if (mask || isMasking(masking))
        size += 4;

    return size;
};

int calcHeadSizeFromBuffer(Local<Object> chunk) {
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

    return length;
};
