var util = require('util');
var should = require('should');

var WebSocketBase = require('../../lib/base');

describe('WebSocketBase', function() {
    
    var wsb;
    var str = 'x-test-ext';
    var func = function() {};

    beforeEach(function() {
        wsb = new WebSocketBase();
    });

    describe('extensions', function() {
        it('should be an empty array as default', function() {
            wsb.extensions.should.be.empty;
            wsb.extensions.should.be.an.instanceOf(Array);
        });
    });

    describe('#addExtension(name, read, write)', function() {
        it('should be a function', function() {
            wsb.addExtension.should.be.a('function');    
        });
        
        it('should throw error on wrong arguments', function() {
            // read not fn
            (function() {
                wsb.addExtension(str, str, func);
            }).should.throwError();
            // write not fn
            (function() {
                wsb.addExtension(str, func, str);
            }).should.throwError();
            // name not str
            (function() {
                wsb.addExtension(func, func, func);
            }).should.throwError();
        });
        
        it('should not throw error on right arguments', function() {
            (function() {
                wsb.addExtension(str, func, func);
            }).should.not.throwError();
        });
        
        it('should return reference of this', function() {
            wsb.addExtension(str, func, func).should.equal(wsb);
        });
        
        it('should add an extension object to internal extensions array', function() {
            wsb.addExtension(str, func, func);
            // check array
            wsb.extensions.should.not.be.empty;
            wsb.extensions.should.have.length(1);
            // check array item
            wsb.extensions[0].should.be.a('object');
            wsb.extensions[0].should.have.property('name', str);
            wsb.extensions[0].should.have.property('read', func);
            wsb.extensions[0].should.have.property('write', func);
            wsb.extensions[0].should.have.property('enabled', false);
        });
    });

    describe('#hasExtension(name)', function() {
        it('should be a function', function() {
            wsb.hasExtension.should.be.a('function');
        });
        it('should throw an error on wrong arguments', function() {
            (function() {
                wsb.hasExtension(func);
            }).should.throwError();
        });
    });

    describe('#removeExtension(name)', function() {
        it('should be a function', function() {
            wsb.removeExtension.should.be.a('function');
        });
        it('should throw an error on wrong arguments', function() {
            (function() {
                wsb.removeExtension(func);
            }).should.throwError();
        });
    });

    describe('#enableExtension([name, names])', function() {
        it('should be a function', function() {
            wsb.enableExtension.should.be.a('function');
        });
        it('should throw an error on wrong arguments', function() {
            (function() {
                wsb.enableExtension(func);
            }).should.throwError();
        });

    });

    describe('#disableExtension([name, names])', function() {
        it('should be a function', function() {
            wsb.disableExtension.should.be.a('function');
        });
        it('should throw an error on wrong arguments', function() {
            (function() {
                wsb.disableExtension(func);
            }).should.throwError();
        });

    });

});
