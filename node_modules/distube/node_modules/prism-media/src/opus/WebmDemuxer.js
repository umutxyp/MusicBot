const WebmBaseDemuxer = require('../core/WebmBase');

const OPUS_HEAD = Buffer.from([...'OpusHead'].map(x => x.charCodeAt(0)));

/**
 * Demuxes a Webm stream (containing Opus audio) to output an Opus stream.
 * @extends core.WebmBaseDemuxer
 * @memberof opus
 * @example
 * const fs = require('fs');
 * const file = fs.createReadStream('./audio.webm');
 * const demuxer = new prism.opus.WebmDemuxer();
 * const opus = file.pipe(demuxer);
 * // opus is now a ReadableStream in object mode outputting Opus packets
 */
class WebmDemuxer extends WebmBaseDemuxer {
  _checkHead(data) {
    if (!data.slice(0, 8).equals(OPUS_HEAD)) {
      throw Error('Audio codec is not Opus!');
    }
  }
}

module.exports = WebmDemuxer;
