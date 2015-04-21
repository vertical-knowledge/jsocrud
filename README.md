#jsocrud
Perform crud operations with a JavaScript object using a string representation of the path at which you wish perform operations.

Disclaimer: This module wraps eval() with RegExp validation on string paths. Use at your own risk.

View the [wiki](https://github.com/vertical-knowledge/jsocrud/wiki) for function documentation.

####Usage
--------------
Here is an example of how you would use this module interact with a JavaScript Object:
```js
> var jsocrud = require('jsocrud');

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
> var object = {'foo': [{'bar': 'baz'}]};
undefined
> jsocrud.get(object, 'foo[0].bar');
'baz'
> jsocrud.get(object, 'foo[1].bar');
Error: No entity exists in the given object at path: .foo[1].bar
> jsocrud.get(object, 'foo[1].bar', 'Nothing there');
'Nothing there'

// - Set (Update) -
> var object = {'foo': [{'bar': 'baz'}]};
undefined
> jsocrud.set(object, 'foo[0].bar', 25);
{ foo: [ { bar: 25 } ] }
> jsocrud.set(object, 'foo[1].baz', 32);
Error: There was an error setting the given value at the path: .foo[1].baz

// - Remove (Delete) -
> var object = {'foo': [{'bar': 'baz'}]};
undefined
> jsocrud.remove(object, 'foo[0].bar');
{ foo: [ {} ] }
```

##Setup for Development
--------------

####Installing
--------------
```sh
git clone git@github.com:vertical-knowledge/jsocrud.git
cd jsocrud
npm install
```

####Running Tests
--------------
```sh
npm test
```
####Generating Wiki Function Documentation
--------------
```sh
npm run-script generate_wiki_documentation
```
