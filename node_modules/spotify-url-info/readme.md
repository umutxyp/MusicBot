<div align="center">
  <img src="https://cdn.microlink.io/logo/banner.png" alt="microlink logo">
  <br>
  <br>
</div>

![Last version](https://img.shields.io/github/tag/microlinkhq/spotify-url-info.svg?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/microlinkhq/spotify-url-info.svg?style=flat-square)](https://coveralls.io/github/microlinkhq/spotify.url-info)
[![NPM Status](https://img.shields.io/npm/dm/spotify-url-info.svg?style=flat-square)](https://www.npmjs.org/package/spotify-url-info)

> Get metadata from Spotify URLs.

## Install

```bash
npm install spotify-url-info
```

## Usage

In order to use the library, you have to provide the fetch agent to use:

```js
const fetch = require('isomorphic-unfetch')
const { getData, getPreview, getTracks, getDetails } = require('spotify-url-info')(fetch)
```

There are four functions:

- **getData**<br/>
Provides the full available data, in a shape that is very similar to [what the spotify API returns](https://developer.spotify.com/documentation/web-api/reference/object-model/).

- **getPreview** <br/>
Always returns the same fields for different types of resources (album, artist, playlist, track). The preview track is the first in the Album, Playlist, etc.

- **getTracks** <br/>
Returns array with tracks. This data is passed on straight from spotify, so the shape could change.Only the first 100 tracks will be returned.

- **getDetails** <br/>
  Returns both the preview and tracks. Should be used if you require information from both of them so that only one request is made.

All the methods receive a Spotify URL (play. or open.) as first argument:

```js
getPreview('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas')
  .then(data => console.log(data))
```

Additionally, you can provide fetch agent options as second argument:

```js
getPreview('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas', {
  headers: {
    'user-agent': 'googlebot'
  }
}).then(data => console.log(data))
```

It returns back the information related to the Spotify URL:

```json
{
  "title": "Immaterial",
  "type": "track",
  "track": "Immaterial",
  "artist": "SOPHIE",
  "image": "https://i.scdn.co/image/d6f496a6708d22a2f867e5acb84afb0eb0b07bc1",
  "audio": "https://p.scdn.co/mp3-preview/6be8eb12ff18ae09b7a6d38ff1e5327fd128a74e?cid=162b7dc01f3a4a2ca32ed3cec83d1e02",
  "link": "https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas",
  "embed": "https://embed.spotify.com/?uri=spotify:track:5nTtCOCds6I0PHMNtqelas",
  "date": "2018-06-15T00:00:00.000Z",
  "description": "description of a podcast episode"
}
```

When a field can't be retrieved, the value will be `undefined`.

There are no guarantees about the shape of this data, because it varies with different media and scraping methods. Handle it carefully.

## License

**spotify-url-info** © [microlink.io](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/spotify-url-info/blob/master/LICENSE.md) License.<br>
Authored by [Karl Sander](https://github.com/karlsander) and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/microlinkhq/spotify-url-info/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlink.io](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
