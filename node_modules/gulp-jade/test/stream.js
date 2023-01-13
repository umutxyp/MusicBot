'use strict';

var test = require('tap').test;

var task = require('../');

var path = require('path');
var fs = require('fs');
var File = require('gulp-util').File;
var PluginError = require('gulp-util').PluginError;

var filePath = path.join(__dirname, 'fixtures', 'helloworld.jade');
var base = path.join(__dirname, 'fixtures');
var cwd = __dirname;

var file = new File({
  path: filePath,
  base: base,
  cwd: cwd,
  contents: fs.createReadStream(filePath)
});

test('should error if contents is a stream', function(t){
  var stream = task();
  stream.on('error', function(err){
    t.ok(err instanceof PluginError, 'not an instance of PluginError');
    t.end();
  });
  stream.write(file);
  stream.end();
});
