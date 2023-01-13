<div align="center">
  <p>
    <a href="https://nodei.co/npm/@distube/soundcloud"><img src="https://nodei.co/npm/@distube/soundcloud.png?downloads=true&downloadRank=true&stars=true"></a>
  </p>
  <p>
    <img alt="npm peer dependency version" src="https://img.shields.io/npm/dependency-version/@distube/soundcloud/peer/distube?style=flat-square">
    <img alt="npm" src="https://img.shields.io/npm/dt/@distube/soundcloud?logo=npm&style=flat-square">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/distubejs/soundcloud?logo=github&logoColor=white&style=flat-square">
    <a href="https://discord.gg/feaDd9h"><img alt="Discord" src="https://img.shields.io/discord/732254550689316914?logo=discord&logoColor=white&style=flat-square"></a>
  </p>
</div>

# @distube/soundcloud

SoundCloud extractor plugin for [DisTube.js.org](https://distube.js.org).

## Feature

- Using SoundCloud API
- Support SoundCloud tracks, albums and playlists
- Search on SoundCloud
- Faster than `youtube-dl` extractor

## Installation

```sh
npm install @distube/soundcloud@latest
```

## Usage

### Plugin

```js
const Discord = require("discord.js");
const client = new Discord.Client();

const { DisTube } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const distube = new DisTube(client, {
  plugins: [new SoundCloudPlugin()],
});
```

### Search

```js
const { SoundCloudPlugin } = require("@distube/soundcloud");
SoundCloudPlugin.search("A SoundCloud Track"); // static method
// Returns an array of 10 DisTube's Songs

const scPlugin = new SoundCloudPlugin();
scPlugin.search("A SoundCloud Playlist", "playlist", 3); // class method
// Returns an array of 3 DisTube's Playlist
```

## Documentation

### new SoundCloudPlugin([SoundCloudPluginOptions])

- `SoundCloudPluginOptions.clientId` [string] _(optional)_: Your account's client id.
- `SoundCloudPluginOptions.oauthToken` [string] _(optional)_: Your account's oauth token. Used to fetch more data with SoundCloud Go+ account.

#### Example

```js
new SpotifyPlugin({
  clientId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  oauthToken: "0-000000-000000000-xxxxxxxxxxxxxx",
});
```

### SoundCloudPlugin.search(query, [type], [limit]) _(Both `static` and `class` method)_

Searches for the given query on SoundCloud.

- Parameters

  - `query` [string] Search query.
  - `type` [string]: Type of results (`track` or `playlist`). Default is `track`.
  - `limit` [integer]: Limit the results. Default is `10`.

- Returns a `Promise<Song[]|Playlist[]>`
  - Returns a `Promise<Song[]>` if `type` parameter is `track`
  - Returns a `Promise<Playlist[]>` if `type` parameter is `playlist`
