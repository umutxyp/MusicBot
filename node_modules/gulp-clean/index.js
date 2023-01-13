'use strict';
var rimraf = require('rimraf');
var es = require('event-stream');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function (options) {
  return es.map(function (file, cb) {
    // Paths are resolved by gulp
    var filepath = file.path;
    var cwd = file.cwd;
    var relative = path.relative(cwd, filepath);

    // Prevent mistakes with paths
    if (!(relative.substr(0, 2) === '..') && relative !== '' || (options ? (options.force && typeof options.force === 'boolean') : false)) {
      rimraf(filepath, function (error) {
        if (!error) {
          return cb(null, file);
        } else {
          return cb(new Error('Unable to delete "' + filepath + '" file (' + error.message + ').'), file);
        }
      });
    } else if (relative === '') {
      gutil.log('gulp-clean: Cannot delete current working directory. (' + filepath + ')');
      return cb(null, file);
    } else {
      gutil.log('gulp-clean: Cannot delete files outside the current working directory. (' + filepath + ')');
      return cb(null, file);
    }
  });
};
