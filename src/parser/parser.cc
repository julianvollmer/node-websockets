#include "parser.h"
#include "calc_head_size.cc"
#include "read_head_bytes.cc"
#include "read_body_bytes.cc"
#include "write_head_bytes.cc"
#include "write_body_bytes.cc"

void init(Handle<Object> exports) {
    exports->Set(String::New("calcHeadSize"), 
            FunctionTemplate::New(CalcHeadSize)->GetFunction());

    exports->Set(String::New("readHeadBytes"),
            FunctionTemplate::New(ReadHeadBytes)->GetFunction());

    exports->Set(String::New("readBodyBytes"),
            FunctionTemplate::New(ReadBodyBytes)->GetFunction());

    exports->Set(String::New("writeHeadBytes"),
            FunctionTemplate::New(WriteHeadBytes)->GetFunction());

    exports->Set(String::New("writeBodyBytes"),
            FunctionTemplate::New(WriteBodyBytes)->GetFunction());
}

NODE_MODULE(parser, init)
