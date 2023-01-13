# gulp-inject [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> A stylesheet, javascript and webcomponent reference injection plugin for [gulp](https://github.com/wearefractal/gulp). No more manual editing of your index.html!

## Installation

First, install `gulp-inject` as a development dependency:

```shell
npm install --save-dev gulp-inject
```

## Basic usage

In your `gulpfile.js`:

### Mode 1: Given a Vinyl File Stream

**Note:** New from `v.0.3`. Here you pipe `inject` through *where* to inject.

```javascript
var inject = require("gulp-inject");

gulp.src('./src/index.html')
  .pipe(inject(gulp.src(["./src/*.js", "./src/*.css"], {read: false}))) // Not necessary to read the files (will speed up things), we're only after their paths
  .pipe(gulp.dest("./dist"));
```

### Mode 2: Given a path to html template

**Note:** Old behavior. Here you pipe `inject` through *what* to inject.

```javascript
var inject = require("gulp-inject");

gulp.src(["./src/*.js", "./src/*.css"], {read: false}) // Not necessary to read the files (will speed up things), we're only after their paths
	.pipe(inject("path/to/your/index.html"))
	.pipe(gulp.dest("./dist"));
```

### Template contents (regardless of mode above)

Add injection tags to your `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My index</title>
  <!-- inject:html -->
  <!-- any *.html files among your sources will go here as: <link rel="import" href="FILE"> -->
  <!-- endinject -->
  <!-- inject:css -->
  <!-- any *.css files among your sources will go here as: <link rel="stylesheet" href="FILE"> -->
  <!-- endinject -->
</head>
<body>

  <!-- inject:js -->
  <!-- any *.js files among your sources will go here as: <script src="FILE"></script> -->
  <!-- endinject -->
</body>
</html>
```

## More examples

### Injecting files from multiple streams

This example demonstrates how to inject files from multiple different streams into the same injection placeholder.

Install [`event-stream`](https://www.npmjs.org/package/event-stream) with: `npm install --save-dev event-stream` and use its [`merge`](https://github.com/dominictarr/event-stream#merge-stream1streamn) function.

**Code:**

```javascript
var es = require('event-stream'),
    inject = require('gulp-inject');

// Concatenate vendor scripts
var vendorStream = gulp.src(['./src/vendors/*.js'])
  .pipe(concat('vendors.js'))
  .pipe(gulp.dest('./dist'));

// Concatenate AND minify app sources
var appStream = gulp.src(['./src/app/*.js'])
  .pipe(concat('app.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./dist'));

gulp.src('./src/index.html')
  .pipe(inject(es.merge(vendorStream, appStream)))
  .pipe(gulp.dest('./dist'));
```

### Injecting some files into `<head>` and some into `<body>`

Use `gulp-inject`'s `starttag` option.

**Code:**

```javascript
var inject = require('gulp-inject');

gulp.src('./src/index.html')
  .pipe(inject(gulp.src('./src/importantFile.js', {read: false}), {starttag: '<!-- inject:head:{{ext}} -->'}))
  .pipe(inject(gulp.src(['./src/*.js', '!./src/importantFile.js'], {read: false})))
  .pipe(gulp.dest('./dist'));
```

And in your `./src/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My index</title>
  <!-- inject:head:js -->
  <!-- only importantFile.js will be injected here -->
  <!-- endinject -->
</head>
<body>

  <!-- inject:js -->
  <!-- the rest of the *.js files will be injected here -->
  <!-- endinject -->
</body>
</html>
```

### Injecting all files for development

If you use [Bower](http://bower.io/) for frontend dependencies I recommend using [`gulp-bower-files`](https://www.npmjs.org/package/gulp-bower-files) and injecting them as well.

**Code:**

```javascript
var bowerFiles = require('gulp-bower-files'),
    inject = require('gulp-inject'),
    stylus = require('gulp-stylus'),
    es = require('event-stream');

var cssFiles = gulp.src('./src/**/*.styl')
  .pipe(stylus())
  .pipe(gulp.dest('./build'));

gulp.src('./src/index.html')
  .pipe(inject(es.merge(
    bowerFiles({read: false}),
    cssFiles,
    gulp.src('./src/app/**/*.js', {read: false})
  )))
  .pipe(gulp.dest('./build'));
```

**Note** remember to mount `./bower_components`, `./build` and `./src/app` as static resources in your server to make this work.

### Injecting into a json-file

You can customize `gulp-inject` further by using the `transform` function option, e.g. by injecting files into a json-file.

**Code:**

```javascript
gulp.src('./files.json')
  .pipe(inject(gulp.src(['./src/*.js', './src/*.css', './src/*.html'], {read: false}), {
    starttag: '"{{ext}}": [',
    endtag: ']',
    transform: function (filepath, file, i, length) {
      return '  "' + filepath + '"' + (i + 1 < length ? ',' : '');
    }
  }))
  .pipe(gulp.dest('./'));
```

Initial contents of `files.json`:

```json
{
  "js": [
  ],
  "css": [
  ],
  "html": [
  ]
}
```

### Injecting dist files into bower.json's main section

**Code:**

```javascript
gulp.src('./bower.json')
  .pipe(inject(gulp.src(['./dist/app.min.js', './dist/app.min.css'], {read: false}), {
    starttag: '"main": [',
    endtag: ']',
    function (filepath, file, i, length) {
      return '  "' + filepath + '"' + (i + 1 < length ? ',' : '');
    }
  }))
  .pipe(gulp.dest('./'));
```

### Injecting all javascript files into a karma config file

**Code:**

```javascript
gulp.src('./karma.conf.js')
  .pipe(inject(gulp.src(['./src/**/*.js'], {read: false}), {
    starttag: 'files: [',
    endtag: ']',
    function (filepath, file, i, length) {
      return '  "' + filepath + '"' + (i + 1 < length ? ',' : '');
    }
  }))
  .pipe(gulp.dest('./'));
```

## API

### inject(fileOrStream, options)

#### fileOrStream
Type: `Stream` or `String`

**If `Stream`**

Since `v.0.3` you can provide a Vinyl File Stream as input to `inject`, see Mode 1 in the example above.

**If `String`**

Can also be a path to the template file (where your injection tags are). Is also used as filename for the plugin's output file.

#### options.templateString
Type: `String`

Default: `NULL`


Is used as template instead of the contents of given `filename`. (Only used if `fileOrStream` is a `String`)

#### options.ignorePath
Type: `String` or `Array`

Default: `NULL`


A path or paths that should be removed from each injected file path.

#### options.addPrefix
Type: `String`

Default: `NULL`


A path that should be prefixed to each injected file path.

#### options.addRootSlash
Type: `Boolean`

Default: `true`


The root slash is automatically added at the beginning of the path ('/').

#### options.starttag
Type: `String`

Default: `<!-- inject:{{ext}} -->`


Set the start tag that the injector is looking for. `{{ext}}` is replaced with file extension name, e.g. "css", "js" or "html".

#### options.endtag
Type: `String`

Default: `<!-- endinject -->`


Set the end tag that the injector is looking for. `{{ext}}` is replaced with file extension name, e.g. "css", "js" or "html".

#### options.transform
Type: `Function(filepath, file, index, length)`

Params:
  - `filepath` - The "unixified" path to the file with any `ignorePath`'s removed
  - `file` - The [File object](https://github.com/wearefractal/vinyl) given from `gulp.src`
  - `index` (0-based file index)
  - `length` (total number of files to inject)

Default: a function that returns:

* For css files: `<link rel="stylesheet" href="<filename>.css">`
* For js files: `<script src="<filename>.js"></script>`
* For html files: `<link rel="import" href="<filename>.html">`


Used to generate the content to inject for each file.

#### options.sort
Type: `Function(a, b)`

Params: `a`, `b` (is used as `compareFunction` for [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort))

Default: `NULL`


If set the given function is used as the compareFunction for the array sort function, to sort the source files by.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-inject
[npm-image]: https://badge.fury.io/js/gulp-inject.png

[travis-url]: http://travis-ci.org/klei/gulp-inject
[travis-image]: https://secure.travis-ci.org/klei/gulp-inject.png?branch=master

[depstat-url]: https://david-dm.org/klei/gulp-inject
[depstat-image]: https://david-dm.org/klei/gulp-inject.png
