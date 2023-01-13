# spotify-uri

> Parse and format the various Spotify URL/URI formats.

**spotify-uri** get passed around in a variety of flavors. This module parses them
into a JavaScript object so you can work with them further. You can also convert
them back into Spotify URIs or HTTP URLs.

## Install

```bash
$ npm install spotify-uri
```

## Usage

Just call `parse` method:

```js
const { parse } = require('spotify-uri')

spotifyUri.parse('spotify:track:3GU4cxkfdc3lIp9pFEMMmw')
// { 
//   uri: 'spotify:track:3GU4cxkfdc3lIp9pFEMMmw',
//   type: 'track',
//   id: '3GU4cxkfdc3lIp9pFEMMmw' 
// }

spotifyUri.parse('http://open.spotify.com/track/1pKYYY0dkg23sQQXi0Q5zN')
// { 
//   uri: 'http://open.spotify.com/track/1pKYYY0dkg23sQQXi0Q5zN',
//   type: 'track',
//   id: '1pKYYY0dkg23sQQXi0Q5zN' 
// }
```

You can also format the parsed objects back into a URI or HTTP URL:

```js
const { parse, formatURI, formatOpenURL, formatPlayURL, formatEmbedURL } = require('spotify-uri')

const parsed = parse('http://open.spotify.com/track/1pKYYY0dkg23sQQXi0Q5zN')

formatURI(parsed) // => 'spotify:track:1pKYYY0dkg23sQQXi0Q5zN'
formatOpenURL(parsed) // => 'http://open.spotify.com/track/1pKYYY0dkg23sQQXi0Q5zN'
formatPlayURL(parsed) // => 'https://play.spotify.com/track/1pKYYY0dkg23sQQXi0Q5zN'
formatEmbedURL(parsed) // => 'https://embed.spotify.com/?uri=spotify:track:1pKYYY0dkg23sQQXi0Q5zN'
```

See the [test cases](./test) for some more examples of Spotify URIs.

## API

### .parse(String uri) → Object

Parses a Spotify URI or a Spotify HTTP(s) URL into an Object. The specific
properties set on the returned Object depend on the "type" of `uri` that gets
passed in. The different "types" are listed below:

### .formatURI(Object parsedUri) → String

Formats a parsed URI Object back into a Spotify URI. For example:

``` js
const { parse, formatURI } = require('spotify-uri')
const parsed = spotifyUri.parse('https://play.spotify.com/track/3GU4cxkfdc3lIp9pFEMMmw')
formatURI(parsed) // => 'spotify:track:3GU4cxkfdc3lIp9pFEMMmw'
```

### .formatOpenURL(Object parsedUri) → String

Formats a parsed URI Object back into a Spotify HTTP "open" URL. For example:

``` js
const { parse, formatOpenURL } = require('spotify-uri')
const parsed = parse('spotify:track:3c1zC1Ma3987kQcHQfcG0Q')
formatOpenURL(parsed) // => 'http://open.spotify.com/track/3c1zC1Ma3987kQcHQfcG0Q'
```

### .formatPlayURL(Object parsedUri) → String

Formats a parsed URI Object back into a Spotify HTTPS "play" URL. For example:

``` js
const { parse, formatPlayURL } = require('spotify-uri')
const parsed = parse('spotify:track:4Jgp57InfWE4MxJLfheNVz')
formatPlayURL(parsed) // => 'https://play.spotify.com/track/4Jgp57InfWE4MxJLfheNVz'
```

### .formatEmbedURL(Object parsedUri) → String

Formats a parsed URI Object back into a Spotify HTTPS "embed" URL. For example:

``` js
const { parse, formatEmbedURL } = require('spotify-uri')
const parsed = parse('spotify:track:6JmI8SpUHoQ4yveHLjTrko')
formatEmbedURL(parsed) // => 'https://embed.spotify.com/?uri=spotify:track:6JmI8SpUHoQ4yveHLjTrko'
```

## License

**spotify-uri** © [Nathan Rajlich](http://n8.io), released under the [MIT](https://github.com/microlinkhq/spotify-url-info/blob/master/LICENSE.md) License.<br>
Authored by [Nathan Rajlich](http://n8.io) and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/microlinkhq/spotify-url-info/contributors).
