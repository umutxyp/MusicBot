[![Logo](https://hydrabolt.me/assets/prism-media-logo.svg)](https://amishshah.github.io/prism-media/)

<div align="center">

[![Build Status](https://travis-ci.org/amishshah/prism-media.svg?branch=master)](https://travis-ci.org/hydrabolt/prism-media)
[![dependencies](https://david-dm.org/amishshah/prism-media/status.svg)](https://david-dm.org/hydrabolt/prism-media)
[![npm](https://img.shields.io/npm/dt/prism-media.svg)](https://www.npmjs.com/package/prism-media)
[![Patreon](https://img.shields.io/badge/donate-patreon-F96854.svg)](https://www.patreon.com/discordjs)

</div>

## What is it?

An easy-to-use stream-based toolkit that you can use for media processing. All the features provided have predictable
abstractions and join together coherently.

```js
// This example will demux and decode an Opus-containing OGG file, and then write it to a file.
const prism = require('prism-media');
const fs = require('fs');

fs.createReadStream('./audio.ogg')
  .pipe(new prism.opus.OggDemuxer())
  .pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
  .pipe(fs.createWriteStream('./audio.pcm'));
```

The example above can work with either a native or pure JavaScript Opus decoder - you don't need to worry about changing
your code for whichever you install.

- FFmpeg support (either through npm modules or a normal installation) 
- Opus support (native or pure JavaScript)
- Demuxing for WebM/OGG files (no modules required!)
- Volume Altering (no modules required!)

## Dependencies

The following dependencies are all optional, and you should only install one from each category (the first listed in
each category is preferred)

- Opus
  - [`@discordjs/opus`](https://github.com/discordjs/opus)
  - [`node-opus`](https://github.com/Rantanen/node-opus)
  - [`opusscript`](https://github.com/abalabahaha/opusscript)
- FFmpeg
  - [`ffmpeg-static`](http://npmjs.com/ffmpeg-static)
  - `ffmpeg` from a [normal installation](https://www.ffmpeg.org/download.html)

## Useful Links

- [Documentation](https://amishshah.github.io/prism-media)
- [Examples](https://github.com/amishshah/prism-media/tree/master/examples)
- [Patreon](https://www.patreon.com/discordjs)

## License

> Copyright 2019 - 2022 Amish Shah
> 
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
> 
>    http://www.apache.org/licenses/LICENSE-2.0
> 
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.