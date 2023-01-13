'use strict';

var test = require('tap').test;

var task = require('../');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');

var filePath = path.join(__dirname, 'fixtures', 'extends.jade');
var base = path.join(__dirname, 'fixtures');
var cwd = __dirname;

var file = new gutil.File({
  path: filePath,
  base: base,
  cwd: cwd,
  contents: fs.readFileSync(filePath)
});

test('should compile a jade template with an extends', function(t){
  var stream = task();
  stream.on('data', function(newFile){
    t.ok(newFile);
    t.ok(newFile.contents);
    t.equal(newFile.contents.toString(), '<div><h1>Hello World</h1></div>');
    t.end();
  });
  stream.write(file);
});
