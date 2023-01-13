# [gulp](https://github.com/wearefractal/gulp)-clean [![Build Status](https://secure.travis-ci.org/peter-vilja/gulp-clean.png?branch=master)](https://travis-ci.org/peter-vilja/gulp-clean) [![NPM version](https://badge.fury.io/js/gulp-clean.png)](http://badge.fury.io/js/gulp-clean)

> Removes files and folders.

## Install

Install with [npm](https://npmjs.org/package/gulp-clean).

```
npm install --save-dev gulp-clean
```

## Example

```js
var gulp = require('gulp');
var clean = require('gulp-clean');

gulp.task('default', function() {
	gulp.src('app/tmp', {read: false})
		.pipe(clean());
});
```
Option read false prevents gulp to read the contents of the file and makes this task a lot faster.

After using gulp-clean the stream still contains the app/tmp and it can be used i.e. for moving the content to different location.

```js
var gulp = require('gulp');
var clean = require('gulp-clean');

gulp.task('default', function() {
	gulp.src('app/tmp/index.js', {read: false})
		.pipe(clean({force: true}));
		.pipe(gulp.dest('dist'));
});
```

#### For safety files and folders outside the current working directory can be removed only with option force set to true.

## License

[MIT](http://en.wikipedia.org/wiki/MIT_License) @ Peter Vilja
