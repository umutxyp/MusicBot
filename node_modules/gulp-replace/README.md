# gulp-replace [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url]
> A string replace plugin for gulp 3

## Usage

First, install `gulp-replace` as a development dependency:

```shell
npm install --save-dev gulp-replace
```

Then, add it to your `gulpfile.js`:

```javascript
var jshint = require('gulp-replace');

gulp.task('templates', function(){
  gulp.src(['file.txt'])
    .pipe(replace(/foo(.{3})/g, '$1foo'))
    .pipe(gulp.dest('build/file.txt'));
});
```


## API

gulp-replace can be called with a string or regex.

### replace(string, replacement)

#### string
Type: `String`

The string to search for.

#### replacement
Type: `String`

The replacement string.

### replace(regex, replace)

*Note:* gulp-replace cannot perform regex replacement on streams.

#### regex
Type: `RegExp`

The regex pattern to search for. See the [MDN documentation for RegExp] for details.

#### replacement
Type: `String` or `Function`

The replacement string or function. See the [MDN documentation for String.replace] for details.


[MDN documentation for RegExp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[MDN documentation for String.replace]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter

[travis-url]: http://travis-ci.org/lazd/gulp-replace
[travis-image]: https://secure.travis-ci.org/lazd/gulp-replace.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-replace
[npm-image]: https://badge.fury.io/js/gulp-replace.png
