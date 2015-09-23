# jsocrud [![Build Status](https://travis-ci.org/vertical-knowledge/jsocrud.svg?branch=master)](https://travis-ci.org/vertical-knowledge/jsocrud)
Perform crud operations within a JavaScript object using a string representation of the path at which you wish perform operations.

View the [wiki](https://github.com/vertical-knowledge/jsocrud/wiki/JSOCRUD.API) for function documentation.

## Usage
--------------

#### Paths
--------------
**What is a path in jsocrud?**

A path is the route in the object you would use to access an element. This can be given in dot or bracket notation.

Examples of acceptable paths and their resulting locations in an object:
* 'foo' -> object.foo
* '.foo' -> object.foo
* "['foo']" -> object.foo
* '["foo"]' -> object.foo
* 'foo.bar' -> object.foo.bar
* 'foo bar.baz' -> object["foo bar"].baz
* '.foo[1]['bar']' -> object.foo[1].bar


#### Code example
--------------
Here are some code examples of how you would use this package interact with JavaScript objects:
```js
> var jsocrud = require('jsocrud');  // Require the package to start

...

// - Insert (Create) -
> var object = {};
undefined
> jsocrud.insert(object, 'foo', {});
{ foo: {} }
> jsocrud.insert(object, 'foo', []);
Error: An entity already exists at path: .foo
> jsocrud.insert(object, 'foo.baz[1]', 'hello');
Error: There was an error setting the given value at the path: foo.baz[1]

// - Get (Read) -
> var object = {'foo': [{'bar': 'baz'}], 'something here': 'hello'};
undefined
> jsocrud.get(object, 'something here');
'hello'
> jsocrud.get(object, 'foo[0].bar');
'baz'
> jsocrud.get(object, 'foo[1].bar');
Error: No entity exists in the given object at the path
> jsocrud.get(object, 'foo[1].bar', 'Nothing there');
'Nothing there'

// - Set (Update) -
> var object = {'foo': [{'bar': 'baz'}]};
undefined
> jsocrud.set(object, 'foo[0].bar', 25);
{ foo: [ { bar: 25 } ] }
> jsocrud.set(object, 'foo[1].baz', 32);
Error: There was an error setting the given value at the given path

// - Remove (Delete) -
> var object = {'foo': [{'bar': 'baz'}]};
undefined
> jsocrud.remove(object, 'foo[0].bar');
{ foo: [ {} ] }
> jsocrud.remove(object, 'foo[1].bar');
Error: There was an error deleting from the given object at the given path
```




## Setup for Development
--------------

#### Installing
--------------
```sh
npm install
```

#### Running Tests
--------------
```sh
npm test
```
