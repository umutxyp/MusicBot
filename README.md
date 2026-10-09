<div align="center">

# Beatra Discord Music Bot - Public Version

![GitHub Stars](https://img.shields.io/github/stars/umutxyp/musicbot?style=social)
![GitHub Forks](https://img.shields.io/github/forks/umutxyp/musicbot?style=social)
![GitHub License](https://img.shields.io/github/license/umutxyp/musicbot)

[Invite the public Beatra bot](https://discord.com/oauth2/authorize?client_id=774043716797071371&permissions=277028620608&scope=applications.commands%20bot) • [Beatra Web Dashboard](https://beatra.app) • [Codeshare](https://codeshare.me)

A fast Discord music bot for YouTube, Spotify, SoundCloud and direct links, with a clean button panel.
You only need **Node.js** and a **bot token**: everything else is installed and checked automatically.

</div>

---

## Contents

1. [Setup (step by step)](#setup-step-by-step)
2. [Starting the bot](#starting-the-bot)
3. [What the startup check does](#what-the-startup-check-does)
4. [Updating](#updating)
5. [Settings (.env)](#settings-env)
6. [YouTube: Sign in to confirm you're not a bot](#youtube-sign-in-to-confirm-youre-not-a-bot)
7. [Commands](#commands)
8. [Troubleshooting](#troubleshooting)
9. [Features](#features)
10. [For developers](#for-developers)

---

## Setup (step by step)

### 1. Install Node.js

Download and install the **LTS** version from **https://nodejs.org** (version 22.12 or newer).
After installing, close and reopen your terminal.

Nothing else is needed. **You do not need to install Python, ffmpeg or yt-dlp**: the bot downloads the right versions for your computer by itself.

### 2. Download the bot

- **With git:** `git clone https://github.com/umutxyp/musicbot.git` and then `cd musicbot`
- **Without git:** on GitHub press **Code > Download ZIP** and extract it.

### 3. Create the Discord bot and get its token

1. Open **https://discord.com/developers/applications** and press **New Application**.
2. Open the **Bot** page and press **Reset Token**. Copy the token. It is a password: never share it.
3. Open the **OAuth2** page, under **OAuth2 URL Generator** tick `bot` and `applications.commands`, then tick these bot permissions: *View Channels, Send Messages, Embed Links, Read Message History, Connect, Speak*. Open the generated link and add the bot to your server.

No "Privileged Gateway Intents" are needed.

### 4. Put the token into `.env`

In the bot folder, copy `.env.example` to a file named `.env` (the bot also creates it for you on the first start) and fill in:

```env
DISCORD_TOKEN=paste_your_token_here
```

That is the only required setting. Everything else in [Settings](#settings-env) is optional.

> On a hosting panel (Pterodactyl, Railway, ...) you can set `DISCORD_TOKEN` as an environment variable instead of using a `.env` file.

---

## Starting the bot

Use whichever you like, they all do the same thing:

| | |
| --- | --- |
| Windows | double-click **`start.bat`** (or `start-shard.bat`) |
| Any system | `npm start` |
| Any system | `node .` or `node index.js` |

The first start takes a little longer: it installs the npm packages and downloads yt-dlp and ffmpeg.
When you see `1 shard(s) running`, the bot is online. Use `/play` in your server.

The bot always runs with **sharding**: one shard for small bots, as many as Discord recommends for large ones, and a crashed shard restarts by itself. `npm run shard` is the same as `npm start`.

To stop the bot press **Ctrl + C**. The queue is saved and continues when the bot starts again.

---

## What the startup check does

Every start begins with a checklist. It fixes what it can by itself and stops with clear instructions for everything else, so the bot never runs half-broken:

```
Beatra startup check

  [ OK ] Node.js 22.12.0
  [ OK ] npm packages
  [ OK ] Discord token  Beatra (application 123456789012345678)
  [ OK ] yt-dlp  2026.09.01
  [ OK ] ffmpeg  ffmpeg version 7.1
  [ OK ] Voice libraries  opus, encryption, DAVE
  [INFO] Spotify API keys not set  optional: large Spotify playlists load only their first 100 songs
```

| Check | Fixed automatically | If it cannot be fixed |
| --- | --- | --- |
| Node.js version | | Stops and tells you to install Node.js 22.12+ |
| npm packages | Runs `npm install` when packages are missing or after an update | Stops and shows the commands to reinstall |
| `.env` file | Created from `.env.example` | Stops and explains how to get the token |
| Discord token | `CLIENT_ID` is detected from the token | Stops when the token is empty or rejected by Discord |
| yt-dlp | Downloaded (no Python needed) and updated once a day | Stops and shows how to install it by hand |
| ffmpeg | Downloaded | Stops and shows how to install it by hand |
| Voice libraries | | Stops and tells you to delete `node_modules` |
| `PROXY_URL`, `COOKIES_FILE`, `GUILD_ID` | | Stops when a value is invalid or the file does not exist |

Example of a stop:

```
  [FAIL] Discord rejected DISCORD_TOKEN (wrong or reset token)
         1. Open https://discord.com/developers/applications and select your bot
         2. Go to "Bot" and press "Reset Token", then copy the token
         3. Paste it into the .env file in the bot folder:  DISCORD_TOKEN=your_token

The bot was not started: 1 problem(s) above must be fixed first.
```

---

## Updating

**If you downloaded with git:**

```bash
git pull
npm start
```

**If you downloaded the ZIP:** download the new ZIP, extract it, and copy your **`.env`** file (and the `data` folder, to keep server settings) from the old folder into the new one. Then start the bot.

The startup check installs new packages by itself after an update, so `npm install` is not needed.

<details>
<summary><b>Updating from v16 (the version before this rewrite)</b></summary>

v16 kept `.env` inside the repository; v17 does not (so a token can never be committed by accident). With git, a plain `git pull` therefore says *"Your local changes to .env would be overwritten"*. Run this once instead:

```bash
# Linux / macOS
cp .env .env.backup && git checkout -- .env && git pull && cp .env.backup .env
```

```bat
:: Windows (cmd)
copy .env .env.backup && git checkout -- .env && git pull && copy /Y .env.backup .env
```

Server languages from v16 (`database/languages.json`) are not carried over: pick them again with `/language`. Everything else carries over: all old `.env` names still work, the volume range (0-100, default 100) is unchanged, and the old `audio_cache` folder is deleted automatically (v17 streams music and never downloads songs).

</details>

---

## Settings (.env)

Only `DISCORD_TOKEN` is required. See `.env.example` for the full list with comments.

| Setting | Default | What it does |
| --- | --- | --- |
| `DISCORD_TOKEN` | | Bot token (**required**) |
| `CLIENT_ID` | from the token | Application id, detected automatically |
| `GUILD_ID` | | Register commands only in this server (for testing) |
| `STATUS` | `/play` | Text after "Listening to" |
| `EMBED_COLOR` | `#5865F2` | Color of the panels |
| `DEFAULT_LANGUAGE` | `en` | Language when a server has not chosen one (servers also follow their Discord language automatically) |
| `DEFAULT_VOLUME` | `100` | Starting volume (0-100) |
| `MAX_QUEUE_SIZE` | `500` | Maximum songs in a queue |
| `MAX_PLAYLIST_SIZE` | `200` | Maximum songs loaded from one playlist |
| `LEAVE_ON_EMPTY` | `60` | Seconds before leaving when nobody listens (`0` = never) |
| `LEAVE_ON_FINISH` | `120` | Seconds to stay after the queue ends (`0` = never leave) |
| `PANEL_REFRESH` | `20` | Seconds between progress bar updates (`0` = only on changes) |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | | Needed only for Spotify playlists with more than 100 songs ([create an app](https://developer.spotify.com/dashboard)) |
| `COOKIES_FILE` | | YouTube cookies file, see the next section |
| `COOKIES_FROM_BROWSER` | | Read YouTube cookies from a browser on this machine (`chrome`, `firefox`, `edge`, `safari`...) |
| `YOUTUBE_PO_TOKEN` | | YouTube PO token (advanced) |
| `YOUTUBE_FALLBACK` | `soundcloud` | When YouTube fails for a song, play it from SoundCloud (the user is told). `off` shows the error instead |
| `PROXY_URL` | | Proxy for YouTube and audio downloads, several separated by commas |
| `YTDLP_PATH` / `FFMPEG_PATH` | downloaded | Use your own yt-dlp / ffmpeg |
| `YTDLP_EXTRACTOR_ARGS` | | Extra yt-dlp `--extractor-args` (advanced) |
| `YTDLP_CONCURRENCY` | `4` | yt-dlp processes at the same time per shard |
| `TOTAL_SHARDS` | `auto` | Number of shards |
| `SHARD_MODE` | `process` | `process` or `worker` |
| `DEBUG` | `false` | Detailed logs for troubleshooting |

### Proxy

```env
PROXY_URL=http://user:password@host:port
PROXY_URL=http://proxy-a:8080,http://proxy-b:8080
```

HTTP(S) and SOCKS proxies both work: songs are found and downloaded by yt-dlp, which uses the proxy. YouTube locks a stream to the IP that requested it, so each server always uses the same proxy from the list.

---

## YouTube: Sign in to confirm you're not a bot

YouTube blocks many VPS and data center IP addresses. When that happens the bot tells you in Discord and in the console. Fix it with cookies from a YouTube account (a secondary account is recommended):

1. In Chrome or Edge install the extension **"Get cookies.txt LOCALLY"** (Firefox: **"cookies.txt"**).
2. Open **youtube.com**, log in, play any video.
3. Click the extension and export the cookies. Save the file as **`cookies.txt`** in the bot folder.
4. Add this line to `.env` and restart the bot:

   ```env
   COOKIES_FILE=./cookies.txt
   ```

The startup check confirms that the file exists. If the bot runs on the same computer where you use YouTube, `COOKIES_FROM_BROWSER=chrome` (or `firefox`, `edge`, `safari`) works without exporting anything. Other options: `YOUTUBE_PO_TOKEN` or `PROXY_URL` with a residential proxy.

yt-dlp updates itself once a day, which fixes most other YouTube errors.

---

## Commands

| Command | What it does |
| --- | --- |
| `/play <song or link> [next]` | Play a song, playlist or link. Suggestions appear while typing. `next` plays it right after the current song |
| `/search <text>` | Pick a song from YouTube results |
| `/nowplaying` | Move the player panel to the bottom of the chat |
| `/pause` `/resume` `/skip` `/previous` `/stop` | Playback |
| `/seek <time>` | Jump to a time, for example `1:30` |
| `/volume <0-100>` | Volume |
| `/loop <off/song/queue>` | Repeat |
| `/autoplay` | Keep playing related songs when the queue ends |
| `/filter <name>` | Bass Boost, Nightcore, Vaporwave, 8D, Karaoke, Echo, Surround, Tremolo |
| `/queue [page]` | Show the queue |
| `/remove` `/move` `/jump` `/clear` `/shuffle` | Edit the queue |
| `/lyrics [song]` | Lyrics |
| `/language` | Change the bot language for the server (needs Manage Server). When no server language is set, replies use each user's Discord language (English if it is not supported) |
| `/help` | All commands and bot statistics |

The player panel has buttons for the same things. Only people in the bot's voice channel can control the music. When everyone leaves, the music pauses; it continues when someone comes back.

---

## Troubleshooting

| Problem | Solution |
| --- | --- |
| `'node' is not recognized` / `command not found: node` | Node.js is not installed or the terminal was opened before installing it. Install it from https://nodejs.org and open a new terminal. |
| The bot stops with `[FAIL]` lines | Do what the lines say; they explain each problem. |
| `npm warn allow-scripts ... not yet covered by allowScripts` | Harmless. Newer npm versions skip package install scripts; the bot downloads what it needs on start. |
| Commands do not show up in Discord | Wait a minute and press **Ctrl + R** in Discord. Check that the bot was invited with `applications.commands`. If `GUILD_ID` is set, the bot must be in that server. |
| The bot joins but there is no sound | Give the bot the **Speak** permission in that channel, make sure it is not server-muted, and check the volume with `/volume`. |
| "YouTube blocked this request (bot detection)" | See [YouTube: Sign in to confirm you're not a bot](#youtube-sign-in-to-confirm-youre-not-a-bot). |
| A song is skipped with "Audio stream failed" | The console shows the real reason next to it. `HTTP Error 403` or "Sign in to confirm" means YouTube is blocking this IP: see [the cookies fix](#youtube-sign-in-to-confirm-youre-not-a-bot). Meanwhile songs are played from SoundCloud automatically (`YOUTUBE_FALLBACK`). |
| Songs take long to start | The console prints one line per song: `Playing "..." from youtube: found in 3.4s, audio after 4.6s`. Finding a YouTube song takes 2-4 seconds; if it is much slower, check the server's connection or use `PROXY_URL`. The very first start also downloads yt-dlp and ffmpeg once. |
| Songs play from SoundCloud instead of YouTube | YouTube refused them; the console says why (usually the IP is blocked). Use [the cookies fix](#youtube-sign-in-to-confirm-youre-not-a-bot). |
| `Your local changes to .env would be overwritten` on `git pull` | See "Updating from v16" in [Updating](#updating). |
| "Voice libraries do not load" | `node_modules` was copied from another computer. Delete the `node_modules` folder and start again. |
| Anything else | Start with `DEBUG=true` in `.env` and read the log. |

---

## Features

| | |
| --- | --- |
| **Fast start** | Songs are streamed, never saved to disk. One yt-dlp call finds the song and its audio, joining the voice channel happens at the same time, and the next song is prepared while the current one plays. |
| **Reliable audio** | yt-dlp downloads the audio the way YouTube expects and passes it to ffmpeg through a local relay, so YouTube's "403 Forbidden" on direct links does not happen. If YouTube still refuses a song, it is played from SoundCloud. |
| **Sources** | YouTube (videos, Shorts, Music, playlists), Spotify (tracks, albums, playlists, artists), SoundCloud, direct audio links and every other site yt-dlp supports. |
| **Player panel** | One panel with cover art, progress, queue preview, text buttons and an audio filter menu (Discord Components V2). |
| **Sharding** | Always on, crashed shards restart automatically. |
| **Resume after restart** | Queue and position are saved and restored. |
| **Proxy, cookies, PO token** | For hosts that YouTube blocks. |
| **23 languages** | Replies use the server language set with `/language`; if none is set, each user's Discord language, and English when that is not supported. Saved as local JSON in `data/guilds/`, no database needed. |
| **No privileged intents** | Only `Guilds` and `GuildVoiceStates`. |

---

## For developers

```bash
npm test         # tests
npm run check    # syntax check of every file and language
npm run deploy   # register slash commands again
```

```
index.js               Entry point: startup check, then the sharding manager
src/
  setup/               Startup check (bootstrap needs no npm packages), launcher
  bot.js               One shard: Discord client, events, graceful shutdown
  config.js            Reads .env
  deploy.js            Slash command registration (only when commands changed)
  commands/            Slash commands
  handlers/            Interaction router and permission checks
  music/               DisTube setup, YouTube extractor, yt-dlp runner, audio relay, sessions, lyrics
  ui/views.js          Components V2 layouts
  core/                Logger, i18n, cache, JSON store, formatting, yt-dlp/ffmpeg download
languages/             Translations
test/                  Tests
bin/                   yt-dlp program folder (downloaded and updated automatically, git-ignored)
data/                  Settings and saved queues (created automatically, git-ignored)
```

## Privacy and legal

- [Privacy Policy](PRIVACY_POLICY.md)
- [Terms of Service](TERMS_OF_SERVICE.md)

## License

MIT
