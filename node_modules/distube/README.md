<div align="center">
  <p>
    <a href="https://www.npmjs.com/package/distube" target="_blank"><img src="https://nodei.co/npm/distube.png?downloads=true&downloadRank=true&stars=true"></a>
  </p>
  <p>
    <a href="https://github.com/skick1234/DisTube/actions" target="_blank"><img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/skick1234/DisTube/Testing?label=Tests&logo=github&style=flat-square"></a>
    <a href="https://nodejs.org/" target="_blank"><img alt="node-current" src="https://img.shields.io/node/v/distube?logo=node.js&logoColor=white&style=flat-square"></a>
    <a href="https://discord.js.org/" target="_blank"><img alt="npm peer dependency version" src="https://img.shields.io/npm/dependency-version/distube/peer/discord.js?label=discord.js&logo=discord&logoColor=white&style=flat-square"></a>
    <a href="https://depfu.com/github/skick1234/DisTube?project_id=36112" target="_blank"><img alt="Depfu" src="https://img.shields.io/depfu/dependencies/github/skick1234/DisTube?style=flat-square"></a>
    <a href="https://app.codecov.io/gh/skick1234/DisTube" target="_blank"><img alt="Codecov branch" src="https://img.shields.io/codecov/c/github/skick1234/DisTube/main?logo=codecov&logoColor=white&style=flat-square&token=WWDYRRSEQW"></a>
    <br>
    <a href="https://www.npmjs.com/package/distube" target="_blank"><img alt="npm" src="https://img.shields.io/npm/dt/distube?logo=npm&style=flat-square"></a>
    <a href="https://github.com/skick1234/DisTube/stargazers" target="_blank"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/skick1234/DisTube?logo=github&logoColor=white&style=flat-square"></a>
    <a href="https://discord.gg/feaDd9h" target="_blank"><img alt="Discord" src="https://img.shields.io/discord/732254550689316914?logo=discord&logoColor=white&style=flat-square"></a>
  </p>
</div>

# DisTube

A Discord.js module to simplify your music commands and play songs with audio filters on Discord without any API key.

[DisTube Support Server](https://discord.gg/feaDd9h) - [Frequently Asked Questions](https://discord.gg/feaDd9h)

## Features

- Based on `@discordjs/voice`
- Easy to use and customize
- Support YouTube and audio link
- Audio filters (bassboost, nightcore, vaporwave,...)
- Autoplay related songs
- Plugin system to support more sites ([Plugin List](https://distube.js.org/#/docs/DisTube/stable/plugin/list))

## Requirement

- Node.js 16.9.0 or higher
- [discord.js](https://discord.js.org) v14
- [@discordjs/voice](https://github.com/discordjs/voice)
- [FFmpeg](https://www.ffmpeg.org/download.html)
- [@discordjs/opus](https://github.com/discordjs/opus)
- [sodium](https://www.npmjs.com/package/sodium) or [libsodium-wrappers](https://www.npmjs.com/package/libsodium-wrappers)

## Installation

```npm
npm install distube@latest
```

## Documentation

Read DisTube's definitions, properties and events details in the [Documentation page](https://distube.js.org/).

## Example Bot

- [DisTube Bot](https://skick.xyz/DisTube) - A music bot with reaction controller, filters, DJ mode, user's custom playlist and voting.
- [DisTube Example](https://github.com/distubejs/example) - Example bot with simple command handler.
- [DisTube Guide](https://distube.js.org/guide) - How to build a music bot from scratch.

## Dependencies

- [node-ytdl-core](https://github.com/fent/node-ytdl-core): YouTube scraper ([DisTube Fork](https://github.com/distubejs/node-ytdl-core))
- [node-ytsr](https://github.com/TimeForANinja/node-ytsr): YouTube search scraper ([DisTube Fork](https://github.com/distubejs/ytsr))
- [node-ytpl](https://github.com/TimeForANinja/node-ytpl): YouTube playlist resolver ([DisTube Fork](https://github.com/distubejs/ytpl))
