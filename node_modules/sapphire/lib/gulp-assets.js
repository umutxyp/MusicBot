'use strict';

var through = require('through2'),
    glob = require('glob'),
    path = require('path'),
    // replaceExt = require('replace-ext'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-assets-formatter';

// var placeholders = {
//   'js' : '<script src="%"></script>',
//   'css' : '<link rel="stylesheet" href="%">'
// };

// function matchExpressions(contents) {
//   return contents.match(/<!--\s+include:([a-z]+)\(([^)]+)\)\s+-->/);
// }

// function replaceExtension(filename, type, options) {

//   if( options.scriptExt && type === 'js' ) {
//     filename = replaceExt(filename, '.' + options.scriptExt);
//   } else if( options.styleExt && type === 'css' ) {
//     filename = replaceExt(filename, '.' + options.styleExt);
//   }

//   return filename;
// }

// function injectFiles(file, options) {

//   var contents = file.contents.toString();
//   var cwd = path.dirname(file.path);
//   var matches = matchExpressions(contents);

//   while( matches ) {

//     var type = matches[1];
//     var placeholder = placeholders[ type ];
//     var files = glob.sync( matches[2], { cwd : cwd } );
//     var includes = '';

//     if( placeholder && files && files.length > 0 ) {

//       includes = files.map(function(filename) {
//         filename = replaceExtension(filename, type, options);
//         return placeholder.split('%').join(filename);
//       }).join('\n');
//     }

//     contents = contents.substring(0, matches.index) + includes + contents.substring(matches.index + matches[0].length);
//     matches = matchExpressions(contents);
//   }

//   return contents;
// }

function gulpIncludeSource(options) {

  options = options || {};

  var stream = through.obj(function(file, enc, callback) {

    if (file.isNull()) {
      this.push(file); // Do nothing if no contents
      return callback();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported!'));
      return callback();
    }

    if (file.isBuffer()) {
      try {
        // console.log(file.path);
        // file.contents = new Buffer( injectFiles( file, options ) );
      } catch (err) {
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
      }
    }

    this.push(options(file));
    return callback();
  });

  return stream;
}

module.exports = gulpIncludeSource;