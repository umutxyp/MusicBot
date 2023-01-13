import { Transform } from 'stream';

interface OpusOptions {
  frameSize: number,
  channels: number,
  rate: number
}

export class OpusStream extends Transform {
  public encoder: any; // TODO: type opusscript/node-opus

  constructor(options?: OpusOptions);
  public static readonly type: 'opusscript' | 'node-opus' | '@discordjs/opus';
  public setBitrate(bitrate: number): void;
  public setFEC(enabled: boolean): void;
  public setPLP(percentage: number): void;
}

export namespace opus {
  interface OpusOptions {
    frameSize: number,
    channels: number,
    rate: number
  }

  export class Encoder extends OpusStream {}
  export class Decoder extends OpusStream {}
  export class OggDemuxer extends Transform {}
  export class WebmDemuxer extends Transform {}
}