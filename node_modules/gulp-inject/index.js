'use strict';

var fs = require('fs'),
    es = require('event-stream'),
    path = require('path'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    File = gutil.File;

module.exports = function(fileOrStream, opt){
  if (!fileOrStream) {
    throw new PluginError('gulp-inject',  'Missing fileOrStream option for gulp-inject');
  }
  if (!opt) {
    opt = {};
  }

  if (opt.transform && typeof opt.transform !== 'function') {
    throw new PluginError('gulp-inject', 'transform option must be a function');
  }
  if (opt.sort && typeof opt.sort !== 'function') {
    throw new PluginError('gulp-inject', 'sort option must be a function');
  }

  // Defaults:
  opt.starttag = opt.starttag || '<!-- inject:{{ext}} -->';
  opt.endtag = opt.endtag || '<!-- endinject -->';
  opt.ignorePath = toArray(opt.ignorePath);
  opt.addRootSlash = typeof opt.addRootSlash !== 'undefined' ? !!opt.addRootSlash : true;
  opt.transform = opt.transform || function (filepath) {
    switch(extname(filepath)) {
      case 'css':
        return '<link rel="stylesheet" href="' + filepath + '">';
      case 'js':
        return '<script src="' + filepath + '"></script>';
      case 'html':
        return '<link rel="import" href="' + filepath + '">';
    }
  };

  // Is the first parameter a Vinyl File Stream:
  if (typeof fileOrStream.on === 'function' && typeof fileOrStream.pipe === 'function') {
    return handleVinylStream(fileOrStream, opt);
  }

  // The first parameter is a filepath:
  var collection = {};
  var firstFile = null;

  function endStream(){
    /* jshint validthis:true */
    if (Object.keys(collection).length === 0) {
      return this.emit('end');
    }
    var templatePath = path.resolve(firstFile.cwd, fileOrStream);
    var template = opt.templateString || fs.readFileSync(templatePath, 'utf8');

    var templateFile = new File({
      cwd: firstFile.cwd,
      base: path.dirname(templatePath),
      path: templatePath,
      contents: getNewContent(template, collection, opt)
    });

    this.emit('data', templateFile);
    this.emit('end');
  }

  return es.through(collector(collection, opt, function (file) {
    if (!firstFile) {
      firstFile = file;
    }
  }), endStream);
};

/**
 * Handle injection when files to
 * inject comes from a Vinyl File Stream
 *
 * @param {Stream} toInject
 * @param {Object} opt
 * @returns {Stream}
 */
function handleVinylStream (toInject, opt) {
  var collected = collectFilesToInject(toInject, opt);

  return es.map(function (source, cb) {
    if (source.isStream()) {
      return cb(new PluginError('gulp-inject', 'Streams not supported for source templates!'));
    }
    collected(function (collection) {
      source.contents = getNewContent(source.contents, collection, opt);
      cb(null, source);
    });
  });
}

/**
 * Collecting files to inject from Vinyl File Stream
 *
 * Returns an almost promise like function which can be
 * called multiple times with a callback, that will be
 * resolved with the result of the file collection.
 *
 * @param {Stream} toInject
 * @param {Object} opt
 * @returns {Function}
 */
function collectFilesToInject (toInject, opt) {
  var collection = {}, done = false, queue = [];

  toInject.pipe(es.through(collector(collection, opt), function () {
    done = true;
    while (queue.length) {
      resolve(queue.shift());
    }
  }));

  function resolve (cb) {
    process.nextTick(function () {
      cb(collection);
    });
  }

  return function (cb) {
    if (done) {
      resolve(cb);
    } else {
      queue.push(cb);
    }
  };
}

/**
 * Create a file collecting function
 * to be used in es.through
 *
 * @param {Object} collection  Collection to fill with files
 * @param {Object} opt
 * @param {Function} cb  Optional callback which will be called for each file
 * @returns {Function}
 */
function collector (collection, opt, cb) {
  return function (file) {
    if (!file.path) {
      return;
    }

    if (cb) {
      cb(file);
    }

    var ext = extname(file.path),
        tag = getTag(opt.starttag, ext);

    if (!collection[tag]) {
      collection[tag] = {ext: ext, starttag: tag, endtag: getTag(opt.endtag, ext), files: []};
    }

    var filepath = removeBasePath([unixify(file.cwd)].concat(opt.ignorePath), unixify(file.path));

    if (opt.addPrefix) {
      filepath = addPrefix(filepath, opt.addPrefix);
    }

    if (opt.addRootSlash) {
      filepath = addRootSlash(filepath);
    } else if (filepath[0] === '/') {
      filepath = filepath.slice(1);
    }

    collection[tag].files.push({file: file, filepath: filepath});
  };
}

/**
 * Get new content for template
 * with all injections made
 *
 * @param {String|Buffer} oldContent
 * @param {Object} collection
 * @param {Object} opt
 * @returns {Buffer}
 */
function getNewContent (oldContent, collection, opt) {
  var keys = Object.keys(collection);
  if (keys.length) {
    return new Buffer(keys.reduce(function eachInCollection (contents, key) {
      var tagInfo = collection[key];
      if (opt.sort) {
        tagInfo.files.sort(opt.sort);
      }
      return contents.replace(
        getInjectorTagsRegExp(tagInfo.starttag, tagInfo.endtag),
        function injector (match, starttag, indent, content, endtag) {
          return [starttag]
            .concat(tagInfo.files.map(function transformFile (file, i, files) {
              return opt.transform(file.filepath, file.file, i, files.length);
            }))
            .concat([endtag])
            .join(indent);
        }
      );
    }, String(oldContent)));
  }
  return oldContent;
}

function getTag (tag, ext) {
  return tag.replace('{{ext}}', ext);
}

function extname (file) {
  return path.extname(file).slice(1);
}

function getInjectorTagsRegExp (starttag, endtag) {
  return new RegExp('(' + escapeForRegExp(starttag) + ')(\\s*)(\\n|\\r|.)*?(' + escapeForRegExp(endtag) + ')', 'gi');
}

function escapeForRegExp (str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function unixify (filepath) {
  return filepath.replace(/\\/g, '/');
}
function addRootSlash (filepath) {
  return filepath.replace(/^\/*([^\/])/, '/$1');
}
function addPrefix (filepath, prefix) {
  return  prefix + filepath;
}

function removeBasePath (basedir, filepath) {
  return toArray(basedir).reduce(function (path, remove) {
    if (path[0] === '/' && remove[0] !== '/') {
      remove = '/' + remove;
    }
    if (remove && path.indexOf(remove) === 0) {
      return path.slice(remove.length);
    }
    return path;
  }, filepath);
}

function toArray (arr) {
  if (!Array.isArray(arr)) {
    return arr ? [arr] : [];
  }
  return arr;
}
