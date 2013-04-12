var crypto = require('crypto');

var MockupSocket = require('../mockup/socket');
var WebSocketCore = require('../../lib/core');

describe('WebSocketCore', function() {

    var msocket, wscore;

    beforeEach(function() {
        msocket = new MockupSocket();
        wscore = new WebSocketCore(msocket);
    });

    describe('#writeHead(options)', function() {

        it('should set fin flag', function() {
            wscore.writeHead({ fin: true });
            wscore._frameWriteState.fin.should.be.true;
        });

        it('should set rsv1 flag', function() {
            wscore.writeHead({ rsv1: true });
            wscore._frameWriteState.rsv1.should.be.true;
        });

        it('should set rsv2 flag', function() {
            wscore.writeHead({ rsv2: true });
            wscore._frameWriteState.rsv2.should.be.true;
        });

        it('should set rsv3 flag', function() {
            wscore.writeHead({ rsv3: true });
            wscore._frameWriteState.rsv3.should.be.true;
        });

        it('should set mask flag', function() {
            wscore.writeHead({ mask: true });
            wscore._frameWriteState.mask.should.be.true;
        });

        it('should set opcode to 0x00', function() {
            wscore.writeHead({ opcode: 0x00 });
            wscore._frameWriteState.opcode.should.equal(0x00);
        });
        
        it('should set opcode to 0x0a', function() {
            wscore.writeHead({ opcode: 0x0a });
            wscore._frameWriteState.opcode.should.equal(0x0a);
        });

        it('should set masking to 0x7e 0xdf 0x20 0xf5', function() {
            var masking = new Buffer([0x7e, 0xdf, 0x20, 0xf5]);
            wscore.writeHead({ masking: masking });
            wscore._frameWriteState.mask.should.be.true;
            wscore._frameWriteState.masking.should.eql(masking);
        });

    });

});
