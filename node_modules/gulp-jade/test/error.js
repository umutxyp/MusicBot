'use strict';

var test = require('tap').test;

var gulp = require('gulp');
var task = require('../');
var path = require('path');

var filename = path.join(__dirname, './fixtures/jade-error.jade');

test('should emit errors of jade correctly', function(t){
  gulp.src(filename)
    .pipe(task()
      .on('error', function(err){
        t.ok(err);
        t.ok(err instanceof Error);
        t.end();
      }));
});
