<div align="center">

# Beatra v17

## WE DO NOT PROVIDE ANY SUPPORT FOR THIS OPEN-SOURCE PROJECT, WHETHER IT INVOLVES SOFTWARE ISSUES OR BUG-RELATED PROBLEMS. PLEASE DO NOT CONTACT US FOR ASSISTANCE WITH ANY ISSUES OR ERRORS YOU ENCOUNTER IN THIS PROJECT!

![GitHub Stars](https://img.shields.io/github/stars/umutxyp/musicbot?style=social)
![GitHub Forks](https://img.shields.io/github/forks/umutxyp/musicbot?style=social)
![GitHub License](https://img.shields.io/github/license/umutxyp/musicbot)

[Invite the public Beatra bot](https://discord.com/oauth2/authorize?client_id=774043716797071371&permissions=277028620608&scope=applications.commands%20bot) • [Beatra Web Dashboard](https://beatra.app) • [Codeshare](https://codeshare.me)

A fast, shard-ready Discord music bot built on **discord.js 14**, **DisTube 5** and **yt-dlp**, with a clean Components V2 player.

</div>

---

## Features

| | |
| --- | --- |
| **Fast start** | One yt-dlp call returns both the song info and the audio stream. Joining the voice channel and resolving the song happen in parallel, and the next song is prepared in the background while the current one plays. |
| **Sources** | YouTube (videos, Shorts, Music, playlists), Spotify (tracks, albums, playlists, artists), SoundCloud, direct audio links and every other site yt-dlp supports (Bandcamp, Vimeo, Twitch...). |
| **Player panel** | A single Components V2 panel with cover art, progress, queue preview and text-only buttons: Previous, Pause, Skip, Stop, Volume, Shuffle, Loop, Autoplay, Queue, Lyrics, plus an audio filter menu. |
| **Sharding** | Always runs under the discord.js ShardingManager. Small bots get one shard, large bots get as many as Discord recommends, and crashed shards restart automatically. |
| **Resume after restart** | The queue and playback position are saved every few seconds and restored when the bot comes back. |
| **Proxy support** | Route YouTube extraction and audio streaming through one or more HTTP(S) proxies. |
| **Autoplay** | Plays related songs when the queue ends. |
| **Lyrics** | Plain lyrics from LRCLIB with pagination. |
| **23 languages** | Per-server language, or the server's Discord language automatically. |
| **No privileged intents** | Only `Guilds` and `GuildVoiceStates` are used. |

## Requirements

- **Node.js 22.12 or newer**
- **FFmpeg**: installed automatically through `ffmpeg-static`, or set `FFMPEG_PATH`, or install it on your system
- **yt-dlp**: downloaded automatically on `npm install` and updated on every install. You can also point `YTDLP_PATH` to your own binary.

## Quick start

```bash
git clone https://github.com/umutxyp/musicbot.git
cd musicbot
npm install
cp .env.example .env   # then fill in DISCORD_TOKEN and CLIENT_ID
npm start
```

On Windows you can use `setup.bat` and then `start.bat`.

Slash commands are registered automatically on startup (only when they changed). Set `GUILD_ID` to register them to a single server instantly while testing. Run `npm run deploy` to force registration.

Invite the bot with your client id:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3230720&scope=bot%20applications.commands
```

## Configuration

Every option lives in `.env` (see `.env.example`). You can also set them as environment variables in your hosting panel.

| Variable | Default | Description |
| --- | --- | --- |
| `DISCORD_TOKEN` | | Bot token (required) |
| `CLIENT_ID` | | Application id (required) |
| `GUILD_ID` | | Register commands to one server only |
| `STATUS` | `/play` | "Listening to ..." status |
| `EMBED_COLOR` | `#5865F2` | Accent color of the panels |
| `DEFAULT_LANGUAGE` | `en` | Language when a server has none set and its Discord language is not available |
| `DEFAULT_VOLUME` | `100` | Starting volume (0-100) |
| `MAX_QUEUE_SIZE` | `500` | Maximum songs in a queue |
| `MAX_PLAYLIST_SIZE` | `200` | Maximum songs loaded from one playlist |
| `LEAVE_ON_EMPTY` | `60` | Seconds to wait before leaving when nobody is listening (0 = stay) |
| `LEAVE_ON_FINISH` | `120` | Seconds to stay after the queue ends (0 = stay) |
| `PANEL_REFRESH` | `20` | Seconds between progress bar updates (0 = only on changes) |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | | Optional. Needed for large Spotify playlists and artists |
| `COOKIES_FILE` / `COOKIES_FROM_BROWSER` | | YouTube cookies, see below |
| `YOUTUBE_PO_TOKEN` | | YouTube PO token, see below |
| `YTDLP_EXTRACTOR_ARGS` | | Extra `--extractor-args` for yt-dlp |
| `YTDLP_PATH` / `FFMPEG_PATH` | | Custom binary paths |
| `YTDLP_CONCURRENCY` | `4` | yt-dlp processes allowed at the same time per shard |
| `PROXY_URL` | | Proxy, or several separated by commas |
| `TOTAL_SHARDS` | `auto` | Shard count |
| `SHARD_MODE` | `process` | `process` or `worker` |
| `DEBUG` | `false` | Verbose DisTube and ffmpeg logs |

### YouTube: Sign in to confirm you're not a bot

YouTube blocks many server IP addresses. Use one of these:

1. **Cookies file (most reliable):** log in to YouTube in a browser, export cookies with an extension such as *Get cookies.txt LOCALLY*, save the file next to the bot and set `COOKIES_FILE=./cookies.txt`.
2. **Browser cookies:** on a machine where you are logged in to YouTube, set `COOKIES_FROM_BROWSER=chrome` (or `firefox`, `edge`, `safari`).
3. **PO token:** set `YOUTUBE_PO_TOKEN` (see the yt-dlp PO Token Guide).
4. **Proxy:** set `PROXY_URL` to a residential HTTP(S) proxy.

Keeping yt-dlp up to date fixes most other YouTube errors: run `npm install` again.

### Proxy

```
PROXY_URL=http://user:pass@host:port
PROXY_URL=http://proxy-a:8080,http://proxy-b:8080
```

HTTP(S) proxies are used both for extraction (yt-dlp) and audio streaming (ffmpeg). YouTube locks stream links to the IP address that requested them, so every server always uses the same proxy from the list. SOCKS proxies only work for extraction because ffmpeg cannot stream through SOCKS.

## Commands

| Command | Description |
| --- | --- |
| `/play <query> [next]` | Play a song, playlist or link. Suggestions appear while typing. `next` puts it right after the current song |
| `/search <query>` | Pick a song from YouTube results |
| `/nowplaying` | Move the player panel to the bottom of the chat |
| `/pause` `/resume` `/skip` `/previous` `/stop` | Playback |
| `/seek <time>` | Jump to a time, for example `1:30` |
| `/volume <0-100>` | Change the volume |
| `/loop <off/song/queue>` | Repeat mode |
| `/autoplay` | Play related songs when the queue ends |
| `/filter <name>` | Bass Boost, Nightcore, Vaporwave, 8D, Karaoke, Echo, Surround, Tremolo |
| `/queue [page]` | Show the queue |
| `/remove` `/move` `/jump` `/clear` `/shuffle` | Edit the queue |
| `/lyrics [song]` | Lyrics of the current song or any song |
| `/language` | Change the server language (Manage Server) |
| `/help` | Commands and statistics |

Only users in the same voice channel as the bot can control playback. If everyone leaves, the music pauses and resumes when someone comes back.

## Project structure

```
index.js               Entry point: registers commands, starts the ShardingManager
src/
  bot.js               One shard: Discord client, events, graceful shutdown
  config.js            Reads .env
  deploy.js            Slash command registration
  commands/            Slash commands
  handlers/            Interaction router and permission checks
  music/
    manager.js         DisTube setup, player panel lifecycle, idle handling, sessions
    plugins.js         YouTube and generic yt-dlp extractors for DisTube
    ytdlp.js           yt-dlp process runner (timeouts, concurrency, proxy, cookies)
    actions.js         Playback actions shared by commands and buttons
    session.js         Saves and restores queues across restarts
    lyrics.js          LRCLIB lyrics
  ui/views.js          Components V2 layouts
  core/                Logger, i18n, cache, JSON store, formatting
languages/             Translations
test/                  Tests (npm test)
data/                  Runtime data (created automatically, git-ignored)
```

## Development

```bash
npm test         # unit and integration tests
npm run check    # syntax check for every file and language
```

## Upgrading from v16

Pull the new version and run `npm install` (the dependencies changed). Everything else carries over:

- Your existing `.env` keeps working; all old variable names are still read. New optional settings are listed in `.env.example`.
- Server languages chosen with v16 (`database/languages.json`) are still used.
- Volume range (0-100) and default (100) are the same as before.
- The old `audio_cache` folder is no longer needed and is deleted automatically on the first start.

## Privacy and legal

- [Privacy Policy](PRIVACY_POLICY.md)
- [Terms of Service](TERMS_OF_SERVICE.md)

## License

MIT
