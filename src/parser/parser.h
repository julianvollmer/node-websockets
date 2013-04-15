#include <v8.h>
#include <node.h>
#include <node_buffer.h>

using namespace v8;

#ifndef NODE_WEBSOCKETS_NATIVE_PARSER_H_
#define NODE_WEBSOCKETS_NATIVE_PARSER_H_

typedef unsigned char byte;
typedef unsigned char byte_t;
typedef unsigned char bytes_t;

typedef unsigned opcode_t;
typedef unsigned long length_t;

struct frame_head_s {
    bool fin;
    bool rsv1;
    bool rsv2;
    bool rsv3;
    bool mask;

    opcode_t opcode;
    length_t length;
    
    bytes_t masking[4];
};

typedef struct frame_head_s frame_head_t;

inline Handle<Value> ThrowError(const char* message) {
    return ThrowException(Exception::Error(String::New(message)));
};
inline Handle<Value> ThrowTypeError(const char* message) {
    return ThrowException(Exception::TypeError(String::New(message)));
};

int calcHeadSizeFromObject(Local<Object> object);
int calcHeadSizeFromBuffer(Local<Object> buffer);

int read_head_bytes(frame_head_t* frame_head, bytes_t* head_bytes);

#endif
