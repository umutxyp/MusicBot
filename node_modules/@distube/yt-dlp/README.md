<div align="center">
  <p>
    <a href="https://nodei.co/npm/@distube/yt-dlp"><img src="https://nodei.co/npm/@distube/yt-dlp.png?downloads=true&downloadRank=true&stars=true"></a>
  </p>
  <p>
    <img alt="npm peer dependency version" src="https://img.shields.io/npm/dependency-version/@distube/yt-dlp/peer/distube?style=flat-square">
    <img alt="npm" src="https://img.shields.io/npm/dt/@distube/yt-dlp?logo=npm&style=flat-square">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/distubejs/yt-dlp?logo=github&logoColor=white&style=flat-square">
    <a href="https://discord.gg/feaDd9h"><img alt="Discord" src="https://img.shields.io/discord/732254550689316914?logo=discord&logoColor=white&style=flat-square"></a>
  </p>
</div>

# @distube/yt-dlp

[yt-dlp](https://github.com/yt-dlp/yt-dlp) extractor plugin for [DisTube.js.org](https://distube.js.org).

# Feature

- Support [900+ sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md) using [yt-dlp](https://github.com/yt-dlp/yt-dlp)

# Requirement

- [python](https://www.python.org/)

# Installation

```sh
npm install @distube/yt-dlp@latest
```

# Documentation

### new YtDlpPlugin([YtDlpPluginOptions])

Create a DisTube's `ExtractorPlugin` instance.

- `YtDlpPluginOptions.update` (`boolean`): Default is `true`. Update the yt-dlp binary when the plugin is initialized.

# Usage

```js
const Discord = require("discord.js");
const client = new Discord.Client();

const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin({ update: true })],
});
```
