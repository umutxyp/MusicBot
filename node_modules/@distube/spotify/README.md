<div align="center">
  <p>
    <a href="https://nodei.co/npm/@distube/spotify"><img src="https://nodei.co/npm/@distube/spotify.png?downloads=true&downloadRank=true&stars=true"></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/distube"><img alt="npm peer dependency version" src="https://img.shields.io/npm/dependency-version/@distube/spotify/peer/distube?style=flat-square"></a>
    <a href="https://nodei.co/npm/distube"><img alt="npm" src="https://img.shields.io/npm/dt/@distube/spotify?logo=npm&style=flat-square"></a>
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/distubejs/spotify?logo=github&logoColor=white&style=flat-square">
    <a href="https://discord.gg/feaDd9h"><img alt="Discord" src="https://img.shields.io/discord/732254550689316914?logo=discord&logoColor=white&style=flat-square"></a>
  </p>
</div>

# @distube/spotify

A DisTube custom plugin for supporting Spotify URL.

## Feature

This plugin grabs the songs on Spotify then searches on YouTube and plays with DisTube.

## Installation

```sh
npm install @distube/spotify@latest
```

## Usage

```js
const Discord = require("discord.js");
const client = new Discord.Client();

const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const distube = new DisTube(client, {
  plugins: [new SpotifyPlugin()],
});
```

## Documentation

### SpotifyPlugin([SpotifyPluginOptions])

- `SpotifyPluginOptions.parallel`: Default is `true`. Whether or not searching the playlist in parallel.
- `SpotifyPluginOptions.emitEventsAfterFetching`: Default is `false`. Emits `addList` and `playSong` event before or after fetching all the songs.
  > If `false`, DisTube plays the first song -> emits `addList` and `playSong` events -> fetches all the rest\
  > If `true`, DisTube plays the first song -> fetches all the rest -> emits `addList` and `playSong` events
- `SpotifyPluginOptions.api`: (Optional) Spotify API options.
  - `SpotifyPluginOptions.api.clientId`: Client ID of your Spotify application (Optional - Used when the plugin cannot get the credentials automatically)
  - `SpotifyPluginOptions.api.clientSecret`: Client Secret of your Spotify application (Optional - Used when the plugin cannot get the credentials automatically)
  - `SpotifyPluginOptions.api.topTracksCountry`: Country code of the top artist tracks (ISO 3166-1 alpha-2 country code). Default is `US`.

#### Example

```js
new SpotifyPlugin({
  parallel: true,
  emitEventsAfterFetching: false,
  api: {
    clientId: "SpotifyAppClientID",
    clientSecret: "SpotifyAppClientSecret",
    topTracksCountry: "VN",
  },
});
```
