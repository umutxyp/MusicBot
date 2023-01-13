[![Build Status](https://travis-ci.org/phated/gulp-jade.png?branch=master)](https://travis-ci.org/phated/gulp-jade)

## Information

<table>
<tr>
<td>Package</td><td>gulp-jade</td>
</tr>
<tr>
<td>Description</td>
<td>Compile Jade templates</td>
</tr>
<tr>
<td>Node Version</td>
<td>≥ 0.10</td>
</tr>
</table>

## Usage

Compile to HTML

```javascript
var jade = require('gulp-jade');

gulp.task('templates', function() {
  var YOUR_LOCALS = {};

  gulp.src('./lib/*.jade')
    .pipe(jade({
      locals: YOUR_LOCALS
    }))
    .pipe(gulp.dest('./dist/'))
});
```

Compile to JS

```javascript
var jade = require('gulp-jade');

gulp.task('templates', function() {
  gulp.src('./lib/*.jade')
    .pipe(jade({
      client: true
    }))
    .pipe(gulp.dest('./dist/'))
});
```

## Options

All options supported by the [Jade API](http://jade-lang.com/api/) are supported

In addition, you can pass in a `locals` or `data` option that will be used as locals for your HTML compilation.  The `locals` option takes precedence over the `data` option.

## AMD

If you are trying to wrap your Jade template functions in an AMD wrapper, use [`gulp-wrap-amd`](https://github.com/phated/gulp-wrap-amd)

```javascript
var jade = require('gulp-jade');
var wrap = require('gulp-wrap-amd');

gulp.task('templates', function() {
  gulp.src('./lib/*.jade')
    .pipe(jade({
      client: true
    }))
    .pipe(wrap({
      deps: ['jade'],
      params: ['jade']
    }))
    .pipe(gulp.dest('./dist/'))
});
```

## Use with [gulp-data](https://www.npmjs.org/package/gulp-data)

As an alternative, the ```gulp-data``` plugin, is a standard method for piping data down-stream to other plugins that need data in the form of a new file property ```file.data```. If you have data from a JSON file, front-matter, a database, or anything really, use ```gulp-data``` to pass that data to gulp-jade.

Retrieve data from a JSON file, keyed on file name:

```
var getJsonData = function(file, cb) {
  var jsonPath = './examples/' + path.basename(file.path) + '.json';
  cb(require(jsonPath));
};

gulp.task('json-test', function() {
  return gulp.src('./examples/test1.html')
    .pipe(data(getJsonData))
    .pipe(jade())
    .pipe(gulp.dest('build'));
});
```

Since gulp-data provides a callback, it means you can get data from a database query as well:

```
var getMongoData = function(file, cb) {
  MongoClient.connect('mongodb://127.0.0.1:27017/gulp-data-test', function(err, db) {
    var collection = db.collection('file-data-test');
    collection.findOne({filename: path.basename(file.path)}, function(err, doc) {
      db.close();
      cb(doc);
    });
  });
};

gulp.task('db-test', function() {
  return gulp.src('./examples/test3.html')
    .pipe(data(getMongoData))
    .pipe(jade())
    .pipe(gulp.dest('build'));
});
````

More info on [gulp-data](https://www.npmjs.org/package/gulp-data)

## LICENSE

(MIT License)

Copyright (c) 2013 Blaine Bublitz

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
