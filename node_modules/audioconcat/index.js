var merge = require('lodash.merge')
var ffmpeg = require('fluent-ffmpeg')
var version = require('./package.json').version

module.exports = exports = function (inputs, opts) {
  return new Audioconcat(inputs, opts)
}

exports.VERSION = version
exports.ffmpeg = ffmpeg

function Audioconcat(inputs, opts) {
  this.inputs = inputs || []
  this.opts = opts || {}
}

Audioconcat.prototype.options = function (opts) {
  merge(this.opts, opts)
  return this
}

Audioconcat.prototype.concat = function (file) {
  if (file) {
    this.opts.output = file
  }
  return concat(this.inputs, this.opts)
}

function concat(inputs, opts) {
  var filter = 'concat:' + inputs.join('|')

  var renderer = ffmpeg()
    .input(filter)
    .outputOptions('-acodec copy')

  var output = opts.output
  if (output) {
    return renderer.save(output)
  }

  return renderer
}
