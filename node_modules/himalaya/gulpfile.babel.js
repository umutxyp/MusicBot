import 'babel-polyfill'
import 'source-map-support/register'

import del from 'del'
import gulp from 'gulp'
import babel from 'gulp-babel'
import sourcemaps from 'gulp-sourcemaps'
import babelify from 'babelify'
import source from 'vinyl-source-stream'
import browserify from 'browserify'
import buffer from 'vinyl-buffer'

gulp.task('default', ['build'])

gulp.task('build', ['cleanLib', 'buildSrc', 'buildDist'])

gulp.task('cleanLib', () => {
  return del(['lib'], {force: true})
})

gulp.task('cleanDist', () => {
  return del(['dist'], {force: true})
})

gulp.task('buildSrc', ['cleanLib'], () => {
  return gulp
    .src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('lib'))
})

gulp.task('buildDist', ['cleanDist'], () => {
  const options = {
    entries: ['index.js'],
    debug: false,
    basedir: 'src',
    standalone: 'himalaya'
  }
  return browserify(options)
    .transform(babelify)
    .bundle()
    .pipe(source('himalaya.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      // loads map from browserify file
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('docs/dist'))
})
