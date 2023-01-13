/**
 * Opus features
 * @namespace opus
 */
module.exports = {
  // Encoder and Decoder
  ...require('./Opus'),
  OggDemuxer: require('./OggDemuxer'),
  WebmDemuxer: require('./WebmDemuxer'),
};
