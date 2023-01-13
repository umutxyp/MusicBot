// Based on discord.js' old volume system

const { Transform } = require('stream');

/**
 * Transforms a stream of PCM volume.
 * @memberof core
 * @extends TransformStream
 */
class VolumeTransformer extends Transform {
  /**
   * @memberof core
   * @param {Object} options Any optional TransformStream options plus some extra:
   * @param {string} options.type The type of transformer: s16le (signed 16-bit little-endian), s16be, s32le, s32be
   * @param {number} [options.volume=1] The output volume of the stream
   * @example
   * // Half the volume of a signed 16-bit little-endian PCM stream
   * input
   *  .pipe(new prism.VolumeTransformer({ type: 's16le', volume: 0.5 }))
   *  .pipe(writeStream);
   */
  constructor(options = {}) {
    super(options);
    switch (options.type) {
      case 's16le':
        this._readInt = (buffer, index) => buffer.readInt16LE(index);
        this._writeInt = (buffer, int, index) => buffer.writeInt16LE(int, index);
        this._bits = 16;
        break;
      case 's16be':
        this._readInt = (buffer, index) => buffer.readInt16BE(index);
        this._writeInt = (buffer, int, index) => buffer.writeInt16BE(int, index);
        this._bits = 16;
        break;
      case 's32le':
        this._readInt = (buffer, index) => buffer.readInt32LE(index);
        this._writeInt = (buffer, int, index) => buffer.writeInt32LE(int, index);
        this._bits = 32;
        break;
      case 's32be':
        this._readInt = (buffer, index) => buffer.readInt32BE(index);
        this._writeInt = (buffer, int, index) => buffer.writeInt32BE(int, index);
        this._bits = 32;
        break;
      default:
        throw new Error('VolumeTransformer type should be one of s16le, s16be, s32le, s32be');
    }
    this._bytes = this._bits / 8;
    this._extremum = Math.pow(2, this._bits - 1);
    this.volume = typeof options.volume === 'undefined' ? 1 : options.volume;
    this._chunk = Buffer.alloc(0);
  }

  _readInt(buffer, index) { return index; }
  _writeInt(buffer, int, index) { return index; }

  _transform(chunk, encoding, done) {
    // If the volume is 1, act like a passthrough stream
    if (this.volume === 1) {
      this.push(chunk);
      return done();
    }

    const { _bytes, _extremum } = this;

    chunk = this._chunk = Buffer.concat([this._chunk, chunk]);
    if (chunk.length < _bytes) return done();

    const complete = Math.floor(chunk.length / _bytes) * _bytes;

    for (let i = 0; i < complete; i += _bytes) {
      const int = Math.min(_extremum - 1, Math.max(-_extremum, Math.floor(this.volume * this._readInt(chunk, i))));
      this._writeInt(chunk, int, i);
    }

    this._chunk = chunk.slice(complete);
    this.push(chunk.slice(0, complete));
    return done();
  }

  _destroy(err, cb) {
    super._destroy(err, cb);
    this._chunk = null;
  }

  /**
   * Sets the volume relative to the input stream - i.e. 1 is normal, 0.5 is half, 2 is double.
   * @param {number} volume The volume that you want to set
   */
  setVolume(volume) {
    this.volume = volume;
  }

  /**
   * Sets the volume in decibels.
   * @param {number} db The decibels
   */
  setVolumeDecibels(db) {
    this.setVolume(Math.pow(10, db / 20));
  }

  /**
   * Sets the volume so that a perceived value of 0.5 is half the perceived volume etc.
   * @param {number} value The value for the volume
   */
  setVolumeLogarithmic(value) {
    this.setVolume(Math.pow(value, 1.660964));
  }

  /**
   * The current volume of the stream in decibels
   * @readonly
   * @type {number}
   */
  get volumeDecibels() {
    return Math.log10(this.volume) * 20;
  }
  /**
   * The current volume of the stream from a logarithmic scale
   * @readonly
   * @type {number}
   */
  get volumeLogarithmic() {
    return Math.pow(this.volume, 1 / 1.660964);
  }
}

module.exports = VolumeTransformer;
