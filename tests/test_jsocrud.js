var assert = require('assert');
var jsocrud = require('..//jsocrud');

describe('jsocrud', function() {
    describe('validatePath', function() {
        it('should throw an error if given an empty path', function(done) {
            assert.throws(function() {jsocrud.validatePath('')});
            done();
        });
        it('should add a leading "." to path if necessary', function(done) {
            var path = jsocrud.validatePath('foo');
            assert.equal('.foo', path);
            done();
        });
        it('should not add a leading "." to path if not necessary', function(done) {
            var path = jsocrud.validatePath('["foo"]');
            assert.equal('["foo"]', path);
            done();
        });
        it('should throw an error if given a malformed path', function(done) {
            assert.throws(function() {jsocrud.validatePath('"foo')});
            assert.throws(function() {jsocrud.validatePath('foo[a]')});
            done();
        });
        it('should only allow word characters following a dot', function(done) {
            assert.equal('.foo', jsocrud.validatePath('foo'));
            assert.throws(function() {
                jsocrud.validatePath('.foo;');
            });
            done();
        });
        it('should allow any characters (except unescaped respective double or single quotes) in quote notation', function(done) {
            var path = '["foo-bar;baz+15"]';
            assert.equal(path, jsocrud.validatePath(path));
            path = "['foo-bar;baz+15']";
            assert.equal(path, jsocrud.validatePath(path));
            done();
        });
        it('should only allow number characters in index notation', function(done) {
            var path = '[1][2][3]';
            assert.equal(path, jsocrud.validatePath(path));
            assert.throws(function() {
                jsocrud.validatePath('[abc123]');
            });
            done();
        });
        it('should not allow malicious paths', function(done) {
            assert.throws(function() {
                jsocrud.validatePath('["foo"]=2;console.log("hi");a={};a["foo"]');
            });

            assert.throws(function() {
                jsocrud.validatePath("['foo']=2;console.log('hi');a={};a['foo']");
            });
            done();
        });
    });
    describe('insert', function() {
        it('should be able to insert string values', function(done) {
            var object = {};
            var value = 'bar';
            jsocrud.insert(object, 'foo', value);
            assert.equal(value, object.foo);
            done();
        });
        it('should be able to insert string values', function(done) {
            var object = {};
            var value = 'bar';
            jsocrud.insert(object, 'foo', value);
            assert.equal(value, object.foo);
            done();
        });
        it('should be able to insert number values', function(done) {
            var object = {};
            var value = 123;
            jsocrud.insert(object, 'foo', value);
            assert.equal(value, object.foo);
            done();
        });
        it('should be able to insert boolean values', function(done) {
            var object = {};
            var value = false;
            jsocrud.insert(object, 'foo', value);
            assert.equal(value, object.foo);
            done();
        });
        it('should be able to insert array values', function(done) {
            var object = {};
            var value = [1, 2, 3];
            jsocrud.insert(object, 'foo', value);
            assert.equal(value.length, object.foo.length);
            done();
        });
        it('should be able to insert "object" values', function(done) {
            var object = {};
            var value = {'works': 'yup'};
            jsocrud.insert(object, 'foo', value);
            assert.equal('yup', object.foo.works);
            done();
        });
        it('should not insert a value if one already exists at the given path', function(done) {
            var object = {'foo': 'bar'};
            var value = 'yolo';
            assert.throws(function() {jsocrud.insert(object, 'foo', value)});
            assert.equal('bar', object.foo);
            done();
        });
        it('should throw an error when attempting to insert a deep value in objects that do not exist', function(done) {
            assert.throws(function() {jsocrud.insert({}, 'foo.bar.baz', 'yolo')});
            done();
        });
    });
    describe('get', function() {
        it('should work with arrays', function(done) {
            assert.equal(2, jsocrud.get([1, 2, 3], '[1]'));
            done();
        });
        it('should work with "objects"', function(done) {
            assert.equal(2, jsocrud.get({'a': 1, 'b': 2}, '["b"]'));
            done();
        });
        it('should work with multiple levels of mixed arrays and objects', function(done) {
            var complexObject = {'foo': ['bar', 'baz'], 'boozle': {'zoo': [0, [1, {'zak': 'zoozle'}], 3, 4]}};
            assert.equal('baz', jsocrud.get(complexObject, '["foo"][1]'));
            assert.equal(0, jsocrud.get(complexObject, '["boozle"]["zoo"][0]'));
            assert.equal('zoozle', jsocrud.get(complexObject, '["boozle"]["zoo"][1][1]["zak"]'));
            done();
        });
        it('should work with dot notation', function(done) {
            var complexObject = {'foo': ['bar', 'baz'], 'boozle': {'zoo': [0, [1, {'zak': 'zoozle'}], 3, 4]}};
            assert.equal('baz', jsocrud.get(complexObject, 'foo[1]'));
            assert.equal(0, jsocrud.get(complexObject, 'boozle.zoo[0]'));
            assert.equal('zoozle', jsocrud.get(complexObject, 'boozle.zoo[1][1].zak'));
            done();
        });
        it('should return the default return value if one is provided and nothing is found', function(done) {
            assert.equal('baz', jsocrud.get({}, 'foo', 'baz'));
            done();
        });
        it('should return the default return value if one is provided and an error occurs', function(done) {
            assert.equal('baz', jsocrud.get({}, 'foo[1].baz["bar"]', 'baz'));
            done();
        });
        it('should throw an error if nothing is found and no default return value is provided', function(done) {
            assert.throws(function() {jsocrud.get({}, 'foo')});
            done();
        });
        it('should throw an error if an error occurs and no default return value is provided', function(done) {
            assert.throws(function() {jsocrud.get({}, 'foo.bar.baz[1]')});
            done();
        });
    });
    describe('set', function() {
        it('should be able to set a value of type string', function(done) {
            var object = {'foo': 'bar'};
            jsocrud.set(object, '["foo"]', 'baz');
            assert.equal('baz', object.foo);
            done();
        });
        it('should be able to set a value of type number', function(done) {
            var object = {'foo': 'bar'};
            jsocrud.set(object, '["foo"]', 2);
            assert.equal(2, object.foo);
            done();
        });
        it('should be able to set a value of type boolean', function(done) {
            var object = {'foo': 'bar'};
            jsocrud.set(object, '["foo"]', false);
            assert.equal(false, object.foo);
            done();
        });
        it('should be able to set a value of type array', function(done) {
            var object = {'foo': 'bar'};
            jsocrud.set(object, '["foo"]', ['baz']);
            assert.equal(1, object.foo.length);
            assert.equal('baz', object.foo[0]);
            done();
        });
        it('should be able to set a value of type "object"', function(done) {
            var object = {'foo': 'bar'};
            jsocrud.set(object, '["foo"]', {'beep': 'boop'});
            assert.equal('boop', object.foo.beep);
            done();
        });
        it('should be able to set a value several layers down', function(done) {
            var object = {'foo': {'bar': [1, {'baz': 'goodbye'}]}, 'yes': 'no'};
            jsocrud.set(object, '["foo"]["bar"][1]["baz"]', 'hello');
            assert.equal('hello', object.foo.bar[1].baz);
            assert.equal(1, object.foo.bar[0]);
            assert.equal('no', object.yes);
            done();
        });
        it('should work with dot notation', function(done) {
            var object = {'foo': {'bar': [1, {'baz': 'goodbye'}]}, 'yes': 'no'};
            jsocrud.set(object, 'foo.bar[1].baz', 'hello');
            assert.equal('hello', object.foo.bar[1].baz);
            assert.equal(1, object.foo.bar[0]);
            assert.equal('no', object.yes);
            done();
        });
        it('should throw an error if the object and path are an invalid combination', function(done) {
            assert.throws(function() {jsocrud.insert({}, 'fop.bar.baz', 'foo')});
            done();
        });
    });
    describe('remove', function() {
       it('should delete from an object at the specified json path', function(done) {
           var object = {'foo': 'bar'};
           jsocrud.remove(object, '["foo"]');
           assert.equal('undefined', typeof object.foo);
           done();
       });
        it('should work with dot notation', function(done) {
            var object = {'foo': 'bar'};
            jsocrud.remove(object, 'foo');
            assert.equal('undefined', typeof object.foo);
            object = {'foo': 'bar'};
            jsocrud.remove(object, '.foo');
            assert.equal('undefined', typeof object.foo);
            done();
       });
        it('should throw an error if deleting a deep value which does not exist', function(done) {
            assert.throws(function() {jsocrud.delete({}, 'foo.bar.baz[1]')});
            done();
        });
    });
});
