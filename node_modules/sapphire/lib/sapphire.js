'use strict';

var _          = require('lodash'),
    gulp       = require('gulp'),
    swapCache  = require('gulp-cache'),
    inject     = require('gulp-inject'),
    jade       = require('gulp-jade'),
    gulpif     = require('gulp-if'),
    concat     = require('gulp-concat'),
    imagemin   = require('gulp-imagemin'),
    uglify     = require('gulp-uglify'),
    minifyHtml = require('gulp-minify-html'),
    rev        = require('gulp-rev'),
    minifyCss  = require('gulp-minify-css'),
    less       = require('gulp-less'),
    clean      = require('gulp-clean'),
    replace    = require('gulp-replace'),
    order       = require('gulp-order'),
    gzip       = require("gulp-gzip")
;


function Sapphire(options) {

    var self = this;

    // Set options
    _.extend(self.options, options);
}

Sapphire.assets             = gulp;

Sapphire.assets.swapCache   = swapCache;
Sapphire.assets.memoryCache = {};

Sapphire.assets.inject      = inject;
Sapphire.assets.if          = gulpif;

Sapphire.assets.jade        = jade;

// concat and minification related methods
Sapphire.assets.concat     = concat;
Sapphire.assets.imagemin   = imagemin;
Sapphire.assets.uglify     = uglify;
Sapphire.assets.minifyHtml = minifyHtml;
Sapphire.assets.minifyCss  = minifyCss;
Sapphire.assets.less       = less;
Sapphire.assets.clean      = clean;
Sapphire.assets.replace    = replace;
Sapphire.assets.rev        = rev;
Sapphire.assets.order      = order;

Sapphire.assets.gzip       = gzip;

Sapphire.prototype.assets = Sapphire.assets;

module.exports = Sapphire;