# audioconcat [![Build Status](https://api.travis-ci.org/h2non/audioconcat.svg?branch=master)][travis] [![NPM](https://img.shields.io/npm/v/audioconcat.svg)][npm]

Tiny [node.js](http://nodejs.org) module to concat multiple audio files using [ffmpeg](http://ffmpeg.org)

audioconcat provides a programmatic interface to do basically the same as calling `ffmpeg` via CLI like:
```
ffmpeg -i "concat:audio1.mp3|audio2.mp3" -acodec copy out.mp3
```

## Requirements

- **[ffmpeg](http://ffmpeg.org)** with additional compilation flags `--enable-libmp3lame`

You can download static builds of ffmpeg from [here](http://johnvansickle.com/ffmpeg/).

If you want to use `audioconcat` in Heroku, you could use the [ffmpeg2](https://github.com/h2non/heroku-buildpack-ffmpeg2) buildpack

## Install

```bash
npm install audioconcat
```

## Usage

```js
var audioconcat = require('audioconcat')

var songs = [
  'beatles.mp3',
  'greenday.mp3',
  'u2.mp3'
]

audioconcat(songs)
  .concat('all.mp3')
  .on('start', function (command) {
    console.log('ffmpeg process started:', command)
  })
  .on('error', function (err, stdout, stderr) {
    console.error('Error:', err)
    console.error('ffmpeg stderr:', stderr)
  })
  .on('end', function (output) {
    console.error('Audio created in:', output)
  })
```

Take a look to the [programmatic API](#api) for more details

## API

### audioconcat(images, [ options ])
Return: `audioconcat`

audioconcat constructor. You should pass an `array<string>` with the desired audio files,
and optionally passing the video render `options` object per each image.

Supported audio formats: `mp3`, `acc`, `ogg` (based on your ffmpeg compilation)

#### audioconcat#concat(output)

Concat files and generate the output audio to the given file path.

#### audioconcat#options(options)

Add custom options to ffmpeg

### audioconcat.VERSION
Type: `string`

Current package semantic version

### audioconcat.ffmpeg
Type: `function`

[fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) API constructor

## License

[MIT](http://opensource.org/licenses/MIT) © Tomas Aparicio

[travis]: http://travis-ci.org/h2non/audioconcat
[gemnasium]: https://gemnasium.com/h2non/audioconcat
[npm]: http://npmjs.org/package/audioconcat
[ffmpeg-api]: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#creating-an-ffmpeg-command
[ffmpeg-colors]: https://www.ffmpeg.org/ffmpeg-utils.html#Color
