const { Transform } = require('stream');

/**
 * Base class for WebmOpusDemuxer and WebmVorbisDemuxer.
 * **You shouldn't directly instantiate this class, use the opus.WebmDemuxer and vorbis.WebmDemuxer
 * implementations instead!**
 * @memberof core
 * @protected
 * @extends TransformStream
 */
class WebmBaseDemuxer extends Transform {
  /**
   * Creates a new Webm demuxer.
   * @private
   * @memberof core
   * @param {Object} [options] options that you would pass to a regular Transform stream.
   */
  constructor(options = {}) {
    super(Object.assign({ readableObjectMode: true }, options));
    this._remainder = null;
    this._length = 0;
    this._count = 0;
    this._skipUntil = null;
    this._track = null;
    this._incompleteTrack = {};
    this._ebmlFound = false;
  }

  _transform(chunk, encoding, done) {
    this._length += chunk.length;
    if (this._remainder) {
      chunk = Buffer.concat([this._remainder, chunk]);
      this._remainder = null;
    }
    let offset = 0;
    if (this._skipUntil && this._length > this._skipUntil) {
      offset = this._skipUntil - this._count;
      this._skipUntil = null;
    } else if (this._skipUntil) {
      this._count += chunk.length;
      done();
      return;
    }
    let result;
    while (result !== TOO_SHORT) {
      try {
        result = this._readTag(chunk, offset);
      } catch (error) {
        done(error);
        return;
      }
      if (result === TOO_SHORT) break;
      if (result._skipUntil) {
        this._skipUntil = result._skipUntil;
        break;
      }
      if (result.offset) offset = result.offset;
      else break;
    }
    this._count += offset;
    this._remainder = chunk.slice(offset);
    done();
    return;
  }

  /**
   * Reads an EBML ID from a buffer.
   * @private
   * @param {Buffer} chunk the buffer to read from.
   * @param {number} offset the offset in the buffer.
   * @returns {Object|Symbol} contains an `id` property (buffer) and the new `offset` (number).
   * Returns the TOO_SHORT symbol if the data wasn't big enough to facilitate the request.
   */
  _readEBMLId(chunk, offset) {
    const idLength = vintLength(chunk, offset);
    if (idLength === TOO_SHORT) return TOO_SHORT;
    return {
      id: chunk.slice(offset, offset + idLength),
      offset: offset + idLength,
    };
  }

  /**
   * Reads a size variable-integer to calculate the length of the data of a tag.
   * @private
   * @param {Buffer} chunk the buffer to read from.
   * @param {number} offset the offset in the buffer.
   * @returns {Object|Symbol} contains property `offset` (number), `dataLength` (number) and `sizeLength` (number).
   * Returns the TOO_SHORT symbol if the data wasn't big enough to facilitate the request.
   */
  _readTagDataSize(chunk, offset) {
    const sizeLength = vintLength(chunk, offset);
    if (sizeLength === TOO_SHORT) return TOO_SHORT;
    const dataLength = expandVint(chunk, offset, offset + sizeLength);
    return { offset: offset + sizeLength, dataLength, sizeLength };
  }

  /**
   * Takes a buffer and attempts to read and process a tag.
   * @private
   * @param {Buffer} chunk the buffer to read from.
   * @param {number} offset the offset in the buffer.
   * @returns {Object|Symbol} contains the new `offset` (number) and optionally the `_skipUntil` property,
   * indicating that the stream should ignore any data until a certain length is reached.
   * Returns the TOO_SHORT symbol if the data wasn't big enough to facilitate the request.
   */
  _readTag(chunk, offset) {
    const idData = this._readEBMLId(chunk, offset);
    if (idData === TOO_SHORT) return TOO_SHORT;
    const ebmlID = idData.id.toString('hex');
    if (!this._ebmlFound) {
      if (ebmlID === '1a45dfa3') this._ebmlFound = true;
      else throw Error('Did not find the EBML tag at the start of the stream');
    }
    offset = idData.offset;
    const sizeData = this._readTagDataSize(chunk, offset);
    if (sizeData === TOO_SHORT) return TOO_SHORT;
    const { dataLength } = sizeData;
    offset = sizeData.offset;
    // If this tag isn't useful, tell the stream to stop processing data until the tag ends
    if (typeof TAGS[ebmlID] === 'undefined') {
      if (chunk.length > offset + dataLength) {
        return { offset: offset + dataLength };
      }
      return { offset, _skipUntil: this._count + offset + dataLength };
    }

    const tagHasChildren = TAGS[ebmlID];
    if (tagHasChildren) {
      return { offset };
    }

    if (offset + dataLength > chunk.length) return TOO_SHORT;
    const data = chunk.slice(offset, offset + dataLength);
    if (!this._track) {
      if (ebmlID === 'ae') this._incompleteTrack = {};
      if (ebmlID === 'd7') this._incompleteTrack.number = data[0];
      if (ebmlID === '83') this._incompleteTrack.type = data[0];
      if (this._incompleteTrack.type === 2 && typeof this._incompleteTrack.number !== 'undefined') {
        this._track = this._incompleteTrack;
      }
    }
    if (ebmlID === '63a2') {
      this._checkHead(data);
      this.emit('head', data);
    } else if (ebmlID === 'a3') {
      if (!this._track) throw Error('No audio track in this webm!');
      if ((data[0] & 0xF) === this._track.number) {
        this.push(data.slice(4));
      }
    }
    return { offset: offset + dataLength };
  }

  _destroy(err, cb) {
    this._cleanup();
    return cb ? cb(err) : undefined;
  }

  _final(cb) {
    this._cleanup();
    cb();
  }

  /**
   * Cleans up the demuxer when it is no longer required.
   * @private
   */
  _cleanup() {
    this._remainder = null;
    this._incompleteTrack = {};
  }
}

/**
 * A symbol that is returned by some functions that indicates the buffer it has been provided is not large enough
 * to facilitate a request.
 * @name WebmBaseDemuxer#TOO_SHORT
 * @memberof core
 * @private
 * @type {Symbol}
 */
const TOO_SHORT = WebmBaseDemuxer.TOO_SHORT = Symbol('TOO_SHORT');

/**
 * A map that takes a value of an EBML ID in hex string form, with the value being a boolean that indicates whether
 * this tag has children.
 * @name WebmBaseDemuxer#TAGS
 * @memberof core
 * @private
 * @type {Object}
 */
const TAGS = WebmBaseDemuxer.TAGS = { // value is true if the element has children
  '1a45dfa3': true, // EBML
  '18538067': true, // Segment
  '1f43b675': true, // Cluster
  '1654ae6b': true, // Tracks
  'ae': true, // TrackEntry
  'd7': false, // TrackNumber
  '83': false, // TrackType
  'a3': false, // SimpleBlock
  '63a2': false,
};

module.exports = WebmBaseDemuxer;

function vintLength(buffer, index) {
  if (index < 0 || index > buffer.length - 1) {
    return TOO_SHORT;
  }
  let i = 0;
  for (; i < 8; i++) if ((1 << (7 - i)) & buffer[index]) break;
  i++;
  if (index + i > buffer.length) {
    return TOO_SHORT;
  }
  return i;
}

function expandVint(buffer, start, end) {
  const length = vintLength(buffer, start);
  if (end > buffer.length || length === TOO_SHORT) return TOO_SHORT;
  let mask = (1 << (8 - length)) - 1;
  let value = buffer[start] & mask;
  for (let i = start + 1; i < end; i++) {
    value = (value << 8) + buffer[i];
  }
  return value;
}
