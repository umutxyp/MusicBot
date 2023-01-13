// Partly based on https://github.com/Rantanen/node-opus/blob/master/lib/Encoder.js

const { Transform } = require('stream');
const loader = require('../util/loader');

const CTL = {
  BITRATE: 4002,
  FEC: 4012,
  PLP: 4014,
};

let Opus = {};

function loadOpus(refresh = false) {
  if (Opus.Encoder && !refresh) return Opus;

  Opus = loader.require([
    ['@discordjs/opus', opus => ({ Encoder: opus.OpusEncoder })],
    ['node-opus', opus => ({ Encoder: opus.OpusEncoder })],
    ['opusscript', opus => ({ Encoder: opus })],
  ]);
  return Opus;
}

const charCode = x => x.charCodeAt(0);
const OPUS_HEAD = Buffer.from([...'OpusHead'].map(charCode));
const OPUS_TAGS = Buffer.from([...'OpusTags'].map(charCode));

// frame size = (channels * rate * frame_duration) / 1000

/**
 * Takes a stream of Opus data and outputs a stream of PCM data, or the inverse.
 * **You shouldn't directly instantiate this class, see opus.Encoder and opus.Decoder instead!**
 * @memberof opus
 * @extends TransformStream
 * @protected
 */
class OpusStream extends Transform {
  /**
   * Creates a new Opus transformer.
   * @private
   * @memberof opus
   * @param {Object} [options] options that you would pass to a regular Transform stream
   */
  constructor(options = {}) {
    if (!loadOpus().Encoder) {
      throw Error('Could not find an Opus module! Please install @discordjs/opus, node-opus, or opusscript.');
    }
    super(Object.assign({ readableObjectMode: true }, options));
    if (Opus.name === 'opusscript') {
      options.application = Opus.Encoder.Application[options.application];
    }
    this.encoder = new Opus.Encoder(options.rate, options.channels, options.application);

    this._options = options;
    this._required = this._options.frameSize * this._options.channels * 2;
  }

  _encode(buffer) {
    return this.encoder.encode(buffer, this._options.frameSize);
  }

  _decode(buffer) {
    return this.encoder.decode(buffer, Opus.name === 'opusscript' ? null : this._options.frameSize);
  }

  /**
   * Returns the Opus module being used - `opusscript`, `node-opus`, or `@discordjs/opus`.
   * @type {string}
   * @readonly
   * @example
   * console.log(`Using Opus module ${prism.opus.Encoder.type}`);
   */
  static get type() {
    return Opus.name;
  }

  /**
   * Sets the bitrate of the stream.
   * @param {number} bitrate the bitrate to use use, e.g. 48000
   * @public
   */
  setBitrate(bitrate) {
    (this.encoder.applyEncoderCTL || this.encoder.encoderCTL)
      .apply(this.encoder, [CTL.BITRATE, Math.min(512e3, Math.max(8e3, bitrate))]);
  }

  /**
   * Enables or disables forward error correction.
   * @param {boolean} enabled whether or not to enable FEC.
   * @public
   */
  setFEC(enabled) {
    (this.encoder.applyEncoderCTL || this.encoder.encoderCTL)
      .apply(this.encoder, [CTL.FEC, enabled ? 1 : 0]);
  }

  /**
   * Sets the expected packet loss over network transmission.
   * @param {number} [percentage] a percentage (represented between 0 and 1)
   */
  setPLP(percentage) {
    (this.encoder.applyEncoderCTL || this.encoder.encoderCTL)
      .apply(this.encoder, [CTL.PLP, Math.min(100, Math.max(0, percentage * 100))]);
  }

  _final(cb) {
    this._cleanup();
    cb();
  }

  _destroy(err, cb) {
    this._cleanup();
    return cb ? cb(err) : undefined;
  }

  /**
   * Cleans up the Opus stream when it is no longer needed
   * @private
   */
  _cleanup() {
    if (Opus.name === 'opusscript' && this.encoder) this.encoder.delete();
    this.encoder = null;
  }
}

/**
 * An Opus encoder stream.
 *
 * Outputs opus packets in [object mode.](https://nodejs.org/api/stream.html#stream_object_mode)
 * @extends opus.OpusStream
 * @memberof opus
 * @example
 * const encoder = new prism.opus.Encoder({ frameSize: 960, channels: 2, rate: 48000 });
 * pcmAudio.pipe(encoder);
 * // encoder will now output Opus-encoded audio packets
 */
class Encoder extends OpusStream {
  /**
   * Creates a new Opus encoder stream.
   * @memberof opus
   * @param {Object} options options that you would pass to a regular OpusStream, plus a few more:
   * @param {number} options.frameSize the frame size in bytes to use (e.g. 960 for stereo audio at 48KHz with a frame
   * duration of 20ms)
   * @param {number} options.channels the number of channels to use
   * @param {number} options.rate the sampling rate in Hz
   */
  constructor(options) {
    super(options);
    this._buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, done) {
    this._buffer = Buffer.concat([this._buffer, chunk]);
    let n = 0;
    while (this._buffer.length >= this._required * (n + 1)) {
      const buf = this._encode(this._buffer.slice(n * this._required, (n + 1) * this._required));
      this.push(buf);
      n++;
    }
    if (n > 0) this._buffer = this._buffer.slice(n * this._required);
    return done();
  }

  _destroy(err, cb) {
    super._destroy(err, cb);
    this._buffer = null;
  }
}

/**
 * An Opus decoder stream.
 *
 * Note that any stream you pipe into this must be in
 * [object mode](https://nodejs.org/api/stream.html#stream_object_mode) and should output Opus packets.
 * @extends opus.OpusStream
 * @memberof opus
 * @example
 * const decoder = new prism.opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });
 * input.pipe(decoder);
 * // decoder will now output PCM audio
 */
class Decoder extends OpusStream {
  _transform(chunk, encoding, done) {
    const signature = chunk.slice(0, 8);
    if (signature.equals(OPUS_HEAD)) {
      this.emit('format', {
        channels: this._options.channels,
        sampleRate: this._options.rate,
        bitDepth: 16,
        float: false,
        signed: true,
        version: chunk.readUInt8(8),
        preSkip: chunk.readUInt16LE(10),
        gain: chunk.readUInt16LE(16),
      });
      return done();
    }
    if (signature.equals(OPUS_TAGS)) {
      this.emit('tags', chunk);
      return done();
    }
    try {
      this.push(this._decode(chunk));
    } catch (e) {
      return done(e);
    }
    return done();
  }
}

module.exports = { Decoder, Encoder };
