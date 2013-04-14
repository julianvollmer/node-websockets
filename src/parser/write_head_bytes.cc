#include "parser.h"

Handle<Value> WriteHeadBytes(const Arguments &args) {
    HandleScope scope;

    Local<Object> state = args[0]->ToObject();

    if (!state->IsObject() || state->IsArray()) {
        ThrowException(Exception::TypeError(
                    String::New("Argument must be an object.")));

        return scope.Close(Undefined());
    }

    if (!state->Has(String::New("opcode"))) {
        ThrowException(Exception::TypeError(
                    String::New("Argument must have property opcode.")));

        return scope.Close(Undefined());
    }

    if (!state->Has(String::New("length"))) {
        ThrowException(Exception::TypeError(
                    String::New("Argument must have property length.")));

        return scope.Close(Undefined());
    }

    int opcode = state->Get(String::New("opcode"))
        ->NumberValue();

    int length = state->Get(String::New("length"))
        ->NumberValue();

    //int headSize = calcHeadSizeFromObj(state);
}
