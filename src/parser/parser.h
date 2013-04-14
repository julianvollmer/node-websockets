#include <v8.h>
#include <node.h>
#include <node_buffer.h>

using namespace v8;

/* is used to convert node::Buffer::Data */
typedef unsigned char byte;

/* error shortucts */
inline Handle<Value> ThrowError(const char* message);
inline Handle<Value> ThrowTypeError(const char* message);

/* internal methods to calculate a ws frame head length */
int calcHeadSizeFromObject(Local<Object> object);
int calcHeadSizeFromBuffer(Local<Object> buffer);
