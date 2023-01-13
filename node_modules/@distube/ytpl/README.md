# node-ytpl

[![NPM version](https://img.shields.io/npm/v/ytpl.svg?maxAge=3600)](https://www.npmjs.com/package/ytpl)
[![NPM downloads](https://img.shields.io/npm/dt/ytpl.svg?maxAge=3600)](https://www.npmjs.com/package/ytpl)
[![codecov](https://codecov.io/gh/timeforaninja/node-ytpl/branch/master/graph/badge.svg)](https://codecov.io/gh/timeforaninja/node-ytpl)
[![Known Vulnerabilities](https://snyk.io/test/github/timeforaninja/node-ytpl/badge.svg)](https://snyk.io/test/github/timeforaninja/node-ytpl)
[![Discord](https://img.shields.io/discord/484464227067887645.svg)](https://discord.gg/V3vSCs7)

[![NPM info](https://nodei.co/npm/ytpl.png?downloads=true&stars=true)](https://nodei.co/npm/ytpl/)

Simple js only module to resolve YouTube playlist ids
Doesn't need any login or GoogleAPI key

*Forked from [ytpl](https://www.npmjs.com/package/ytsr).*

# Support
You can contact us for support on our [chat server](https://discord.gg/V3vSCs7)

# Usage

```js
var ytpl = require('ytpl');

ytpl('UU_aEa8K-EOJ3D6gOs7HcyNg').then(playlist => {
  dosth(playlist);
}).catch(err => {
  console.error(err);
});
```


# API
### ytpl(id, [options])

Attempts to resolve the given playlist id

* `id`
    * id of the yt-playlist
    * or playlist link
    * or user link (resolves uploaded playlist)
    * or channel link (resolves uploaded playlist)
* `options`
    * object with options
    * possible settings:
    * limit[Number] -> limits the pulled items, defaults to 100, set to Infinity to get the whole playlist - numbers <1 result in the default being used
    * All additional parameters will get passed to [miniget](https://github.com/fent/node-miniget), which is used to do the https requests

* returns a Promise
* [Example response](https://github.com/timeforaninja/node-ytpl/blob/master/example/example_output)

### ytpl.validateID(string)

Returns true if able to parse out a (formally) valid playlist ID.

### ytpl.getPlaylistID(string)

Returns a playlist ID from a YouTube URL. Can be called with the playlist ID directly, in which case it resolves.

Returns a promise.


# Related / Works well with

* [node-ytdl-core](https://github.com/fent/node-ytdl-core)
* [node-ytsr](https://github.com/TimeForANinja/node-ytsr)


# Install

    npm install --save ytpl



# License
MIT
