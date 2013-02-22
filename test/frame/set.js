var should = require('should');

var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var frame;

    beforeEach(function() {
        frame = new WebSocketFrame();
    });

    describe('#set(key, value)', function() {
    
        it('should be a prototype function', function() {
            frame.set.should.be.a('function');
        });

        it('should throw an error if property is not a string', function() {
            (function() {
                frame.set({});
            }).should.throwError();
        });

        it('should return a property of the object', function() {
            var value = { one: "two" };
            frame.set('someProperty', value);
            frame.someProperty.should.equal(value);
        });

    });

});
