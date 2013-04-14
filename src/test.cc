#include <v8.h>
#include <node.h>
#include <node_buffer.h>

using namespace v8;

Handle<Value> CreateBuffer(const Arguments &args) {
    HandleScope scope;

    char chunk[4];

    chunk[0] = 0x48;
    chunk[1] = 0x7a;
    chunk[2] = 0xcc;
    chunk[3] = 0x0f;

    scope.Close(node::Buffer::New(chunk, 4)->handle_);
}

void Init(Handle<Object> exports) {
    exports->Set(String::New("createBuffer"), 
            FunctionTemplate::New(CreateBuffer)->GetFunction());
}

NODE_MODULE(test, Init)
