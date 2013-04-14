#include "parser.h"

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
