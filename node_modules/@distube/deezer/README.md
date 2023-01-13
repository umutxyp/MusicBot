<div align="center">
  <p>
    <a href="https://nodei.co/npm/@distube/deezer"><img src="https://nodei.co/npm/@distube/deezer.png?downloads=true&downloadRank=true&stars=true"></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/distube"><img alt="npm peer dependency version" src="https://img.shields.io/npm/dependency-version/@distube/deezer/peer/distube?style=flat-square"></a>
    <a href="https://nodei.co/npm/distube"><img alt="npm" src="https://img.shields.io/npm/dt/@distube/deezer?logo=npm&style=flat-square"></a>
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/distubejs/deezer?logo=github&logoColor=white&style=flat-square">
    <a href="https://discord.gg/feaDd9h"><img alt="Discord" src="https://img.shields.io/discord/732254550689316914?logo=discord&logoColor=white&style=flat-square"></a>
  </p>
</div>

# @distube/deezer

A DisTube custom plugin for supporting Deezer URL.

## Feature

This plugin grabs the songs on Deezer then searches on YouTube and plays with DisTube.

## Installation

```sh
npm install @distube/deezer@latest
```

## Usage

```js
const Discord = require("discord.js");
const client = new Discord.Client();

const { DisTube } = require("distube");
const { DeezerPlugin } = require("@distube/deezer");
const distube = new DisTube(client, {
  plugins: [new DeezerPlugin()],
});
```

## Documentation

### DeezerPlugin([DeezerPluginOptions])

- `DeezerPluginOptions.parallel`: Default is `true`. Whether or not searching the playlist in parallel.
- `DeezerPluginOptions.emitEventsAfterFetching`: Default is `false`. Emits `addList` and `playSong` event before or after fetching all the songs.
  > If `false`, DisTube plays the first song -> emits `addList` and `playSong` events -> fetches all the rest\
  > If `true`, DisTube plays the first song -> fetches all the rest -> emits `addList` and `playSong` events

#### Example

```js
new DeezerPlugin({
  parallel: true,
  emitEventsAfterFetching: false,
});
```
