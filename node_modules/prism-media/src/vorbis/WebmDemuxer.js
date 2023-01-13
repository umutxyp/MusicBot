const WebmBaseDemuxer = require('../core/WebmBase');

const VORBIS_HEAD = Buffer.from([...'vorbis'].map(x => x.charCodeAt(0)));

/**
 * Demuxes a Webm stream (containing Vorbis audio) to output a Vorbis stream.
 * @memberof vorbis
 * @extends core.WebmBaseDemuxer
 */
class WebmDemuxer extends WebmBaseDemuxer {
  _checkHead(data) {
    if (data.readUInt8(0) !== 2 || !data.slice(4, 10).equals(VORBIS_HEAD)) {
      throw Error('Audio codec is not Vorbis!');
    }

    this.push(data.slice(3, 3 + data.readUInt8(1)));
    this.push(data.slice(3 + data.readUInt8(1), 3 + data.readUInt8(1) + data.readUInt8(2)));
    this.push(data.slice(3 + data.readUInt8(1) + data.readUInt8(2)));
  }
}

module.exports = WebmDemuxer;
