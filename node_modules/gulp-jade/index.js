'use strict';

var through = require('through2');
var compile = require('jade').compile;
var compileClient = require('jade').compileClient;
var ext = require('gulp-util').replaceExtension;
var PluginError = require('gulp-util').PluginError;

function handleCompile(contents, opts){
  if(opts.client){
    return compileClient(contents, opts);
  }

  return compile(contents, opts)(opts.locals || opts.data);
}

function handleExtension(filepath, opts){
  if(opts.client){
    return ext(filepath, '.js');
  }
  return ext(filepath, '.html');
}

module.exports = function(options){
  var opts = options || {};

  function CompileJade(file, enc, cb){
    opts.filename = file.path;

    if (file.data) {
      opts.data = file.data;
    }

    file.path = handleExtension(file.path, opts);

    if(file.isStream()){
      return cb(new PluginError('gulp-jade', 'Streaming not supported'));
    }

    if(file.isBuffer()){
      try {
        file.contents = new Buffer(handleCompile(String(file.contents), opts));
      } catch(e) {
        return cb(new PluginError('gulp-jade', e));
      }
    }
    cb(null, file);
  }

  return through.obj(CompileJade);
};
