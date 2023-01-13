# object-assign [![Build Status](https://travis-ci.org/sindresorhus/object-assign.svg?branch=master)](https://travis-ci.org/sindresorhus/object-assign)

> ES6 [`Object.assign()`](http://www.2ality.com/2014/01/object-assign.html) ponyfill

> Ponyfill: A polyfill that doesn't overwrite the native method


## Install

Download [manually](https://github.com/sindresorhus/object-assign/releases) or with a package-manager.

```bash
$ npm install --save object-assign
```

```bash
$ bower install --save object-assign
```

```bash
$ component install sindresorhus/object-assign
```


## Usage

```js
objectAssign({foo: 0}, {bar: 1});
//=> {foo: 0, bar: 1}

// multiple sources
[{bar: 1}, {baz: 2}].reduce(objectAssign, {foo: 0});
//=> {foo: 0, bar: 1, baz: 2}
```


## API

### objectAssign(target, source)

Assigns enumerable own properties of the `source` object to the `target` object and returns the `target` object.


## Multiple sources

Unfortunately support for multiple sources aren't defined in the Object.assign spec.

However, you can easily achieve it with `[target, source, source, ...].reduce(objectAssign)`.


## Resources

- [ES6 spec - Object.assign](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign)


## License

[MIT](http://opensource.org/licenses/MIT) © [Sindre Sorhus](http://sindresorhus.com)
