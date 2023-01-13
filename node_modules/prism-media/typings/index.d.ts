import { Transform } from 'stream';

import { ChildProcess } from 'child_process';
import { Duplex } from 'stream';

import { opus } from './opus';
import { vorbis } from './vorbis';

export interface FFmpegOptions {
  args?: string[];
  shell?: boolean;
}

export interface FFmpegInfo {
  command: string;
  info: string;
  version: string;
  output: string;
}

export class FFmpeg extends Duplex {
  public process: ChildProcess;
  constructor(options?: FFmpegOptions);
  static getInfo(force?: boolean): FFmpegInfo;
}

export interface VolumeOptions {
  type: 's16le' | 's16be' | 's32le' | 's32be',
  volume?: number
}

export class VolumeTransformer extends Transform {
  public volume: number;

  constructor(options: VolumeOptions);
  public setVolume(volume: number): void;
  public setVolumeDecibels(db: number): void;
  public setVolumeLogarithmic(value: number): void;
  public readonly volumeDecibels: number;
  public readonly volumeLogarithmic: number;
}

export { opus, vorbis };
