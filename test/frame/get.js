var WebSocketFrame = require('../../lib/frame');

describe('WebSocketFrame', function() {

    var frame;

    beforeEach(function() {
        frame = new WebSocketFrame();
    });

    describe('#get(property)', function() {
    
        it('should be a prototype function', function() {
            frame.get.should.be.a('function');
        });

        it('should throw an error if property is not a string', function() {
            (function() {
                frame.get({});
            }).should.throwError();
        });

        it('should return a property of the object', function() {
            var value = { one: "two" };
            frame.someProperty = value;
            frame.get('someProperty').should.equal(value);
        });

    });

});
