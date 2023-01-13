const ChildProcess = require('child_process');
const { Duplex } = require('stream');

let FFMPEG = {
  command: null,
  output: null,
};

const VERSION_REGEX = /version (.+) Copyright/mi;

Object.defineProperty(FFMPEG, 'version', {
  get() {
    return VERSION_REGEX.exec(FFMPEG.output)[1];
  },
  enumerable: true,
});

/**
 * An FFmpeg transform stream that provides an interface to FFmpeg.
 * @memberof core
 */
class FFmpeg extends Duplex {
  /**
   * Creates a new FFmpeg transform stream
   * @memberof core
   * @param {Object} options Options you would pass to a regular Transform stream, plus an `args` option
   * @param {Array<string>} options.args Arguments to pass to FFmpeg
   * @param {boolean} [options.shell=false] Whether FFmpeg should be spawned inside a shell
   * @example
   * // By default, if you don't specify an input (`-i ...`) prism will assume you're piping a stream into it.
   * const transcoder = new prism.FFmpeg({
   *  args: [
   *    '-analyzeduration', '0',
   *    '-loglevel', '0',
   *    '-f', 's16le',
   *    '-ar', '48000',
   *    '-ac', '2',
   *  ]
   * });
   * const s16le = mp3File.pipe(transcoder);
   * const opus = s16le.pipe(new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 }));
   */
  constructor(options = {}) {
    super();
    this.process = FFmpeg.create({ shell: false, ...options });
    const EVENTS = {
      readable: this._reader,
      data: this._reader,
      end: this._reader,
      unpipe: this._reader,
      finish: this._writer,
      drain: this._writer,
    };

    this._readableState = this._reader._readableState;
    this._writableState = this._writer._writableState;

    this._copy(['write', 'end'], this._writer);
    this._copy(['read', 'setEncoding', 'pipe', 'unpipe'], this._reader);

    for (const method of ['on', 'once', 'removeListener', 'removeListeners', 'listeners']) {
      this[method] = (ev, fn) => EVENTS[ev] ? EVENTS[ev][method](ev, fn) : Duplex.prototype[method].call(this, ev, fn);
    }

    const processError = error => this.emit('error', error);
    this._reader.on('error', processError);
    this._writer.on('error', processError);
  }

  get _reader() { return this.process.stdout; }
  get _writer() { return this.process.stdin; }

  _copy(methods, target) {
    for (const method of methods) {
      this[method] = target[method].bind(target);
    }
  }

  _destroy(err, cb) {
    this._cleanup();
    return cb ? cb(err) : undefined;
  }

  _final(cb) {
    this._cleanup();
    cb();
  }

  _cleanup() {
    if (this.process) {
      this.once('error', () => {});
      this.process.kill('SIGKILL');
      this.process = null;
    }
  }


  /**
   * The available FFmpeg information
   * @typedef {Object} FFmpegInfo
   * @memberof core
   * @property {string} command The command used to launch FFmpeg
   * @property {string} output The output from running `ffmpeg -h`
   * @property {string} version The version of FFmpeg being used, determined from `output`.
   */

  /**
   * Finds a suitable FFmpeg command and obtains the debug information from it.
   * @param {boolean} [force=false] If true, will ignore any cached results and search for the command again
   * @returns {FFmpegInfo}
   * @throws Will throw an error if FFmpeg cannot be found.
   * @example
   * const ffmpeg = prism.FFmpeg.getInfo();
   *
   * console.log(`Using FFmpeg version ${ffmpeg.version}`);
   *
   * if (ffmpeg.output.includes('--enable-libopus')) {
   *   console.log('libopus is available!');
   * } else {
   *   console.log('libopus is unavailable!');
   * }
   */
  static getInfo(force = false) {
    if (FFMPEG.command && !force) return FFMPEG;
    const sources = [() => {
      const ffmpegStatic = require('ffmpeg-static');
      return ffmpegStatic.path || ffmpegStatic;
    }, 'ffmpeg', 'avconv', './ffmpeg', './avconv'];
    for (let source of sources) {
      try {
        if (typeof source === 'function') source = source();
        const result = ChildProcess.spawnSync(source, ['-h'], { windowsHide: true });
        if (result.error) throw result.error;
        Object.assign(FFMPEG, {
          command: source,
          output: Buffer.concat(result.output.filter(Boolean)).toString(),
        });
        return FFMPEG;
      } catch (error) {
        // Do nothing
      }
    }
    throw new Error('FFmpeg/avconv not found!');
  }

  /**
   * Creates a new FFmpeg instance. If you do not include `-i ...` it will be assumed that `-i -` should be prepended
   * to the options and that you'll be piping data into the process.
   * @param {String[]} [args=[]] Arguments to pass to FFmpeg
   * @returns {ChildProcess}
   * @private
   * @throws Will throw an error if FFmpeg cannot be found.
   */
  static create({ args = [], shell = false } = {}) {
    if (!args.includes('-i')) args.unshift('-i', '-');
    return ChildProcess.spawn(FFmpeg.getInfo().command, args.concat(['pipe:1']), { windowsHide: true, shell });
  }
}

module.exports = FFmpeg;
