#include <v8.h>
#include <node.h>

using namespace v8;

Handle<Value> Method(const Arguments &args) {
    HandleScope scope;
    
    return scope.Close(String::New("World"));
}

void init(Handle<Object> exports) {
    exports->Set(String::New("hello"), 
            FunctionTemplate::New(Method)->GetFunction());
}

NODE_MODULE(parser, init);
