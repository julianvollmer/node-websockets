#include "parser.h"

Handle<Value> ReadBodyBytes(const Arguments &args) {
    HandleScope scope;
    
    Local<Object> state = args[0]->ToObject();
    Local<Object> chunk = args[1]->ToObject();

    if (!state->IsObject() || state->IsArray()) {
        ThrowTypeError("Argument one must be an object.");

        return scope.Close(Undefined());
    }

    if (!state->Has(String::New("index"))) {
        ThrowTypeError("Argument one must have property index.");

        return scope.Close(Undefined());
    }

    if (!state->Has(String::New("length"))) {
        ThrowTypeError("Argument one must have property length.");

        return scope.Close(Undefined());
    }

    if (!node::Buffer::HasInstance(chunk)) {
        ThrowTypeError("Argument two must be a buffer.");

        return scope.Close(Undefined());
    }

    /* copy state.mask to boolean */
    bool mask = state->Get(String::New("mask"))
        ->BooleanValue();

    /* copy state.index to integer */
    int index = state->Get(String::New("index"))
        ->NumberValue();
    
    /* copy state.length to integer */
    int plength = state->Get(String::New("length"))
        ->NumberValue();

    /* copy chunk.length to integer */
    int clength = node::Buffer::Length(chunk);

    /* says us how much we need to read from chunk */
    int toRead = plength - index;

    if (toRead > clength)
        toRead = clength;

    /* copy buffer data to unsigned char array */
    byte* bodyChunk = (byte*) node::Buffer::Data(chunk);

    /* if we already have read enough return an empty buffer */
    if (toRead == 0)
        return scope.Close(node::Buffer::New(0)->handle_);

    /* else it can be that chunk is bigger than required */
    byte* body = (byte*) malloc(toRead);

    /* so we copy only the required item pointers */
    for (int i = 0; i < toRead; i++)
        body[i] = bodyChunk[i];

    /* free memory of body chunk because we do not require it anymore */
    /*free(bodyChunk);*/

    if (mask) {
        byte* masking = (byte*) node::Buffer::Data(state->Get(String::New("masking"))
                ->ToObject());

        for (int i = 0; i < toRead; i++)
            body[i] = body[i] ^ masking[(i + index) % 4];
    }

    index += toRead;

    state->Set(String::New("index"), Number::New(index));

    return scope.Close(node::Buffer::New((char*)body, toRead)->handle_);
}
