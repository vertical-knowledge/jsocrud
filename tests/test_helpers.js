var assert = require('assert');
var helpers = require('../helpers');

describe('helpers', function() {
    describe('ValidatedPath', function() {
        it('should properly set given attributes when constructed', function(done) {
            var path = 'path';
            var firstPathPart = 'firstPathPart';
            var pathRemainder = 'pathRemainder';
            var validatedPath = new helpers.ValidatedPath(path, firstPathPart, pathRemainder);
            assert.equal(path, validatedPath.path);
            assert.equal(firstPathPart, validatedPath.firstPathPart);
            assert.equal(pathRemainder, validatedPath.pathRemainder);
            done();
        });
    });
    describe('isEscaped', function() {
        it('should return true for characters which are  escaped', function(done) {
            assert.equal(true, helpers.isEscaped(1, '\\"'));
            assert.equal(true, helpers.isEscaped(3, '\\\\\\"'));
            done();
        });
        it('should return false for characters which are not escaped', function(done) {
            assert.equal(false, helpers.isEscaped(1, '""'));
            assert.equal(false, helpers.isEscaped(2, '\\\\""'));
            assert.equal(false, helpers.isEscaped(4, '\\\\\\\\""'));
            done();
        });
    });
    describe('formatFirstPathPart', function() {
        it('should handle empty strings', function(done) {
            assert.equal('[""]', helpers.formatFirstPathPart(''));
            done();
        });
        it('should handle strings with no double-quotation marks', function(done) {
            assert.equal('["foo[1].$_bar[\'baz\']"]', helpers.formatFirstPathPart('foo[1].$_bar[\'baz\']'));
            done();
        });
        it('should not escape single-quotation marks', function(done) {
            assert.equal('["she\'s all mine"]', helpers.formatFirstPathPart('she\'s all mine'));
            done();
        });
        it('should escape unescaped quotation marks', function(done) {
            assert.equal('["\\""]', helpers.formatFirstPathPart('"'));
            done();
        });
        it('should not escape already escaped quotation marks', function(done) {
            assert.equal('["\\""]', helpers.formatFirstPathPart('\\"'));
            done();
        });
        it('should not recognize escaped slashes as escape characters', function(done) {
            assert.equal('["\\""]', helpers.formatFirstPathPart('\\"'));
            assert.equal('["\\\\\\""]', helpers.formatFirstPathPart('\\\\"'));
            done();
        });

    });
    describe('convertFirstPathPart', function() {
        it('should handle paths with no periods or brackets', function(done) {
            var validatedPath = helpers.convertFirstPathPart('foo');
            assert.equal('["foo"]', validatedPath.path);
            assert.equal('foo', validatedPath.firstPathPart);
            assert.equal('', validatedPath.pathRemainder);
            done();
        });
        it('should handle paths with leading slashes', function(done) {
            var validatedPath = helpers.convertFirstPathPart('\\foo');
            assert.equal('["\\foo"]', validatedPath.path);
            assert.equal('\\foo', validatedPath.firstPathPart);
            assert.equal('', validatedPath.pathRemainder);
            done();
        });
        it('should handle paths with trailing slashes', function(done) {
            var validatedPath = helpers.convertFirstPathPart('a\\');
            assert.equal('["a\\"]', validatedPath.path);
            assert.equal('a\\', validatedPath.firstPathPart);
            assert.equal('', validatedPath.pathRemainder);
            done();
        });
        it('should include escaped brackets in the path part', function(done) {
            var validatedPath = helpers.convertFirstPathPart('foo\\[ bar');
            assert.equal('["foo\\[ bar"]', validatedPath.path);
            assert.equal('foo\\[ bar', validatedPath.firstPathPart);
            assert.equal('', validatedPath.pathRemainder);
            done();
        });
        it('should include escaped periods in the path part', function(done) {
            var validatedPath = helpers.convertFirstPathPart('foo\\. bar');
            assert.equal('["foo\\. bar"]', validatedPath.path);
            assert.equal('foo\\. bar', validatedPath.firstPathPart);
            assert.equal('', validatedPath.pathRemainder);
            done();
        });
        it('should include mixed escaped periods and brackets in the path part', function(done) {
            var validatedPath = helpers.convertFirstPathPart('foo\\. ba\\[r \\[baz \\.');
            assert.equal('["foo\\. ba\\[r \\[baz \\."]', validatedPath.path);
            assert.equal('foo\\. ba\\[r \\[baz \\.', validatedPath.firstPathPart);
            assert.equal('', validatedPath.pathRemainder);
            done();
        });
        it('should not recognize escaped slashes as escape characters', function(done) {
            var validatedPath = helpers.convertFirstPathPart('foo\\\\.bar');
            assert.equal('["foo\\\\"].bar', validatedPath.path);
            assert.equal('foo\\\\', validatedPath.firstPathPart);
            assert.equal('.bar', validatedPath.pathRemainder);
            done();
        });
        it('should handle paths with dot delimiters', function(done) {
            var validatedPath = helpers.convertFirstPathPart('foo.bar');
            assert.equal('["foo"].bar', validatedPath.path);
            assert.equal('foo', validatedPath.firstPathPart);
            assert.equal('.bar', validatedPath.pathRemainder);
            done();
        });
        it('should handle paths with single-quoted bracket delimiters', function(done) {
            var validatedPath = helpers.convertFirstPathPart('foo[\'bar\']');
            assert.equal('["foo"][\'bar\']', validatedPath.path);
            assert.equal('foo', validatedPath.firstPathPart);
            assert.equal('[\'bar\']', validatedPath.pathRemainder);
            done();
        });
        it('should handle paths with double-quoted bracket delimiters', function(done) {
            var validatedPath = helpers.convertFirstPathPart('foo["bar"]');
            assert.equal('["foo"]["bar"]', validatedPath.path);
            assert.equal('foo', validatedPath.firstPathPart);
            assert.equal('["bar"]', validatedPath.pathRemainder);
            done();
        });
        it('should handle paths with number and  bracket delimiters', function(done) {
            var validatedPath = helpers.convertFirstPathPart('foo[1]');
            assert.equal('["foo"][1]', validatedPath.path);
            assert.equal('foo', validatedPath.firstPathPart);
            assert.equal('[1]', validatedPath.pathRemainder);
            done();
        });
    });
    describe('validatePath', function() {
        it('should throw an error if given an empty path', function(done) {
            assert.throws(function() {helpers.validatePath('')});
            done();
        });
        it('should convert first path part to bracket notation if necessary', function(done) {
            var path = helpers.validatePath('foo').path;
            assert.equal('["foo"]', path);
            done();
        });
        it('should not convert first path part to bracket notation if not necessary', function(done) {
            var path = helpers.validatePath('["foo"]').path;
            assert.equal('["foo"]', path);
            done();
        });
        it('should only allow word characters and dollar signs in dot notation paths', function(done) {
            assert.equal('.$foo', helpers.validatePath('.$foo').path);
            assert.throws(function() {
                helpers.validatePath('.foo;');
            });
            done();
        });
        it('should not allow dot notation paths to begin with a number', function(done) {
            assert.throws(function() {
                helpers.validatePath('.1');
            });
            assert.throws(function() {
                helpers.validatePath('.1');
            });
            done();
        });
        it('should allow any characters (except unescaped respective double or single quotes) in quote notation', function(done) {
            var path = '["foo-bar;baz+15"]';
            assert.equal(path, helpers.validatePath(path).path);
            path = "['foo-bar;baz+15']";
            assert.equal(path, helpers.validatePath(path).path);
            path = "['1foo-bar;baz+15']";
            assert.equal(path, helpers.validatePath(path).path);
            done();
        });
        it('should only allow number characters in index notation', function(done) {
            var path = '[1][2][3]';
            assert.equal(path, helpers.validatePath(path).path);
            assert.throws(function() {
                helpers.validatePath('[abc123]');
            });
            done();
        });
        it('should not allow paths with unescaped quotes', function(done) {
            assert.throws(function() {
                helpers.validatePath('["foo"]=2;console.log("hi");a={};a["foo"]');
            });
            assert.throws(function() {
                helpers.validatePath("['foo']=2;console.log('hi');a={};a['foo']");
            });
            done();
        });
        it('should give empty firstPathPart and pathRemainder if the first path part did not need to be converted', function(done) {
            var validatedPath = helpers.validatePath('["foo"]');
            assert.equal('', validatedPath.firstPathPart);
            assert.equal('', validatedPath.pathRemainder);
            done();
        });
        it('should give populated firstPathPart and pathRemainder if the first path part needed to be converted', function(done) {
            var validatedPath = helpers.validatePath('foo.bar');
            assert.equal('foo', validatedPath.firstPathPart);
            assert.equal('.bar', validatedPath.pathRemainder);
            done();
        });
    });
    describe('parsePath', function() {
        it('should be able to parse dot notation components', function(done) {
            var path = '.foo.bar._1';
            var parsedPath = helpers.parsePath({path: path});
            assert.equal(3, parsedPath.length);
            assert.equal('foo', parsedPath[0]);
            assert.equal('bar', parsedPath[1]);
            assert.equal('_1', parsedPath[2]);
            done();
        });
        it('should be able to parse bracket notation double-quoted components', function(done) {
            var path = '["foo"]["bar"]["1"]';
            var parsedPath = helpers.parsePath({path: path});
            assert.equal(3, parsedPath.length);
            assert.equal('foo', parsedPath[0]);
            assert.equal('bar', parsedPath[1]);
            assert.equal('1', parsedPath[2]);
            done();
        });
        it('should be able to parse bracket notation single-quoted components', function(done) {
            var path = "['foo']['bar']['1']";
            var parsedPath = helpers.parsePath({path: path});
            assert.equal(3, parsedPath.length);
            assert.equal('foo', parsedPath[0]);
            assert.equal('bar', parsedPath[1]);
            assert.equal('1', parsedPath[2]);
            done();
        });
        it('should be able to parse bracket notation index components', function(done) {
            var path = "[1][2][3]";
            var parsedPath = helpers.parsePath({path: path});
            assert.equal(3, parsedPath.length);
            assert.equal(1, parsedPath[0]);
            assert.equal(2, parsedPath[1]);
            assert.equal(3, parsedPath[2]);
            done();
        });
        it('should be able to parse a combination of different notation components', function(done) {
            var path = "[1].foo['3']";
            var parsedPath = helpers.parsePath({path: path});
            assert.equal(3, parsedPath.length);
            assert.equal(1, parsedPath[0]);
            assert.equal('foo', parsedPath[1]);
            assert.equal('3', parsedPath[2]);
            done();
        });
        it('should use firstPathPart and pathRemainder when firstPathPart is not falsy', function(done) {
            var validatedPath = new helpers.ValidatedPath(
                '["\"foo\""].bar.baz',
                '"foo"',
                '.bar.baz'
            );
            var parsedPath = helpers.parsePath(validatedPath);
            assert.equal(3, parsedPath.length);
            assert.equal('"foo"', parsedPath[0]);
            assert.equal('bar', parsedPath[1]);
            assert.equal('baz', parsedPath[2]);
            done();
        });
    });
});
