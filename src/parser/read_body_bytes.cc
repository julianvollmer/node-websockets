#include "parser.h"

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
