<div align="center">

# MusicMaker v16.0 🎶

![GitHub Stars](https://img.shields.io/github/stars/umutxyp/musicbot?style=social)
![GitHub Forks](https://img.shields.io/github/forks/umutxyp/musicbot?style=social)
![GitHub Issues](https://img.shields.io/github/issues/umutxyp/musicbot)
![GitHub License](https://img.shields.io/github/license/umutxyp/musicbot)

[Invite the public MusicMaker bot](https://discord.com/oauth2/authorize?client_id=774043716797071371&permissions=277028620608&scope=applications.commands%20bot) • [Support Server](https://discord.gg/ACJQzJuckW) • [MusicMaker Web Dashboard](https://music-maker.app) • [CodeShare](https://codeshare.me)

## Project Highlights
| Capability | Details |
| --- | --- |
| 🎛️ Dynamic Embeds | Auto-refreshing "Now Playing" cards with cover art, platform badges, queue countdowns, and localized metadata. |
| 🪄 Smart Queue | Instant mix-ins, sequential preloading, shuffle with DJ-only guardrails, and playlist collapsing to keep channels tidy. |
| 🔁 Loop Modes | Three-way loop toggle: Off, Track Repeat (endless current song), or Queue Repeat (restart queue when finished). |
| 🎲 Autoplay Engine | Genre-aware autoplay with intelligent filtering—select from 20 genres (Pop, Rock, Hip-Hop, Anime, Lo-Fi, etc.) and the bot automatically queues matching music when your queue ends, filtering out tutorials, podcasts, and non-music content with smart duration and keyword detection. |
| 💾 Local Audio Cache | All tracks are pre-downloaded and cached locally to eliminate stream interruptions, network lag, and voice crackling—delivering buffer-free playback even during peak Discord load or ISP throttling. |
| 🛡️ Resilient Playback | Voice connection watchdog, stream retry logic, idle auto-disconnect, and graceful SIGINT shutdown. |
| 🧠 Localization | Cached translations via `node-json-db` with runtime language switching and fallback logic. |
| 📜 Static Lyrics | Fetches lyrics from Genius (web scraping) with LRCLIB fallback—button-only display with pagination support. |
| ⚙️ Extensible Core | Modular providers (`src/YouTube.js`, `src/Spotify.js`, `src/SoundCloud.js`, `src/DirectLink.js`) let you add more sources quickly. |generation Discord music bot crafted with **discord.js v14**, engineered for cinematic embeds, lossless playback, and frictionless control across desktop and mobile.

</div>

---

## ✨ Why MusicMaker?

- **Slash-first UX** – `/play`, `/search`, `/language`, `/nowplaying`, and `/help` respond instantly with localized embeds and live-updating buttons.
- **Platform polyglot** – Streams from YouTube, Spotify, SoundCloud, or a direct MP3/WAV/OGG link. Spotify albums, playlists, and artist radios turn into fully hydrated queues.
- **Adaptive UI** – A two-row control deck (Pause, Skip, Stop, Queue, Shuffle, Volume) stays in sync with the audio engine and locks down expired sessions automatically.
- **Edge-ready audio core** – Preloads entire queues, heals voice reconnections, and falls back gracefully when Discord or upstream services hiccup.
- **Global voice** – 21 fully translated language packs shipped out-of-the-box with instant server switching.
- **Privacy-first** – Stores only the language preference per guild in a local JSON database. No chat logs, no audio recordings.

---

## 🗺️ Table of Contents

1. [Project Highlights](#project-highlights)
2. [Folder Anatomy](#folder-anatomy)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Configuration](#configuration)
6. [Spotify API Setup](#spotify-api-setup)
7. [Genius API Setup (Optional)](#genius-api-setup-optional)
8. [YT-DLP Cookie Add](#youtube-cookie-setup)
9. [Sharding for Large Bots (1000+ Servers)](#sharding-for-large-bots-1000-servers)
10. [Slash Commands & Controls](#slash-commands--controls)
11. [Language Support](#language-support)
12. [Deployment Tips](#deployment-tips)
13. [Troubleshooting](#troubleshooting)
14. [Privacy & Legal](#privacy--legal)
15. [Contributing](#contributing)

---

## Folder Anatomy

```
discord-musicbot/
├── commands/           # Slash command handlers (play, help, search, language, ...)
├── events/             # Button & modal controllers for playback UI
├── src/                # Core services: MusicPlayer, MusicEmbedManager, providers
├── languages/          # 21 JSON language packs
├── database/           # node-json-db store for guild language preferences
├── config.js           # Central configuration + env fallbacks
├── index.js            # Bot bootstrap, client wiring, voice auto-cleanup
├── LICENSE             # MIT License
├── PRIVACY_POLICY.md   # Data handling details
└── TERMS_OF_SERVICE.md # Acceptable use guidelines
```

---

## Prerequisites

- **Node.js** ≥ 18 (LTS recommended) and npm.
- **Git** for cloning the repository.
- **Discord application** with a bot user created in the [Discord Developer Portal](https://discord.com/developers/applications).
- *(Optional but recommended)* A VPS or host with stable bandwidth and low latency to Discord voice regions.

> ℹ️ `ffmpeg-static` ships with the project. You do **not** need a system-wide FFmpeg unless you prefer using a custom build.

---

## Quick Start

### Windows fast track

```powershell
# Run from the repo root
.\setup.bat
# Edit the generated .env with your credentials
.\start.bat
```

`setup.bat` verifies Node.js/npm, installs dependencies, and scaffolds a `.env` template if you don’t have one yet. `start.bat` makes sure your environment is ready and launches the bot via `npm run start`.

### Cross-platform manual steps

```powershell
# 1. Clone & enter
git clone https://github.com/umutxyp/musicbot.git discord-musicbot
cd discord-musicbot

# 2. Install dependencies
npm install

# 3. Configure secrets (see below)
Copy-Item .env .env.backup -ErrorAction SilentlyContinue
# Edit .env with your token, client ID, Spotify credentials, etc.

# 4. Boot the bot
npm run start
# or
node index.js
```

Slash commands register automatically when the bot starts. Guild-scoped deployment executes within seconds if `GUILD_ID` is provided; global rollout can take up to an hour per Discord caching rules.

---

## Configuration

MusicMaker reads from both `config.js` defaults and environment variables via `.env`. Update whichever approach fits your hosting workflow.

### `.env` Cheat Sheet

```dotenv
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=optional_guild_for_fast_testing
SPOTIFY_CLIENT_ID=spotify_client_id
SPOTIFY_CLIENT_SECRET=spotify_client_secret
GENIUS_CLIENT_ID=optional_genius_client_id
GENIUS_CLIENT_SECRET=optional_genius_client_secret
STATUS=🎵 MusicMaker | /play
EMBED_COLOR=#FF6B6B
SUPPORT_SERVER=https://discord.gg/ACJQzJuckW
WEBSITE=https://musicmaker.vercel.app
COOKIES_FROM_BROWSER=chrome
COOKIES_FILE=./cookies.txt
```

### Key Settings

| Setting | Location | Purpose |
| --- | --- | --- |
| `discord.token` | `.env` → `config.discord.token` | Discord bot token used for login and REST registration. |
| `discord.clientId` | `.env` → `config.discord.clientId` | Application ID required to register slash commands. |
| `discord.guildId` | `.env` → `config.discord.guildId` | Optional testing guild ID for <1 minute command deployment. Leave blank for global registration. |
| `bot.status` | `.env`/`config.js` | Activity text shown as "Listening to ...". |
| `bot.embedColor` | `.env`/`config.js` | Hex color for all embeds. |
| `bot.supportServer` & `bot.website` | `.env`/`config.js` | Populates help links and README badges. |
| `spotify.clientId` & `spotify.clientSecret` | `.env`/`config.js` | Enables Spotify search, playlist and album expansion. |
| `genius.clientId` & `genius.clientSecret` | `.env`/`config.js` | Optional Genius API credentials for higher rate limits (works without via web scraping). |
| `ytdl.cookiesFromBrowser` & `ytdl.cookiesFile` | `.env`/`config.js` | It is an optional feature to add cookies against YouTube cookie errors. |

> 🔐 Never commit `.env` to source control. Use deployment secrets in your hosting provider or create environment variables at runtime.

---

## Spotify API Setup

1. Visit the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/), sign in, and click **Create an App**.
2. Name your integration (e.g., `MusicMaker Bot`) and enable **Web API**.
3. Reveal and copy the **Client ID** and **Client Secret**.
4. Add a redirect URI (any valid URL, e.g., `https://localhost/callback`) – although client credentials flow is used, Spotify requires at least one placeholder.
5. Paste both values into your `.env` (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`).
6. Restart the bot. The credentials are cached and refreshed automatically with the client credentials grant.

Without these credentials Spotify requests fall back to zero results.

---

## Genius API Setup (Optional)

MusicMaker uses **web scraping** by default to fetch lyrics from Genius—no API key required! However, if you want **higher rate limits** and **faster responses**, you can optionally add Genius API credentials.

### Why Use Genius API?

| Without API Key | With API Key |
| --- | --- |
| ✅ Works perfectly via web scraping | ✅ Higher rate limits |
| ✅ No registration needed | ✅ Faster response times |
| ⚠️ May hit rate limits on heavy use | ✅ Official API support |

### Setup Steps

1. Visit the [Genius API Clients Page](https://genius.com/api-clients), sign in with your Genius account (or create one).
2. Click **New API Client** and fill in:
   - **App Name:** `MusicMaker Bot` (or any name)
   - **App Website URL:** `https://localhost` (placeholder is fine)
   - **Redirect URI:** `https://localhost/callback` (not used, but required)
3. Click **Save** and reveal your **Client ID** and **Client Secret**.
4. Copy both values and add them to your `.env`:
   ```dotenv
   GENIUS_CLIENT_ID=your_genius_client_id
   GENIUS_CLIENT_SECRET=your_genius_client_secret
   ```
5. Restart the bot. The Genius client will now use API authentication.

> 💡 **Note:** Even without credentials, lyrics work perfectly! The bot automatically scrapes Genius.com and falls back to LRCLIB if needed.

### Lyrics Priority

The bot fetches lyrics in this order:
1. **Genius** (with API key if provided, otherwise web scraping)
2. **LRCLIB** (free lyrics database)
3. If both fail, no lyrics button appears

---

## YouTube Cookie Setup

YouTube may occasionally block yt-dlp with a "Sign in to confirm you're not a bot" error. To fix this, you need to provide browser cookies to yt-dlp.

### Method 1: Using Browser Cookies (Recommended)

1. Open your `.env` file or set environment variables
2. Add one of the following based on your browser:
   ```env
   # For Chrome users
   COOKIES_FROM_BROWSER=chrome
   
   # For Firefox users
   COOKIES_FROM_BROWSER=firefox
   
   # For Edge users
   COOKIES_FROM_BROWSER=edge
   
   # For Safari users
   COOKIES_FROM_BROWSER=safari
   ```

3. Make sure you're logged into YouTube in that browser
4. Restart your bot

**Note:** This method automatically extracts cookies from your browser, so you need to be logged into YouTube in the specified browser.

### Method 2: Using cookies.txt File

1. Install a browser extension to export cookies:
   - **Chrome/Edge:** [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
   - **Firefox:** [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)

2. Go to YouTube while logged in and export cookies to a file named `cookies.txt`

3. Place `cookies.txt` in your bot's root directory (same folder as `index.js`)

4. Add to your `.env` file:
   ```env
   COOKIES_FILE=./cookies.txt
   ```

5. Restart your bot

### Verifying the Fix

After setting up cookies, test with:
```bash
npm start
```

If you still see bot detection errors:
- Make sure you're logged into YouTube in your browser
- Try clearing your browser cookies and logging in again
- Regenerate the cookies.txt file
- Try a different browser

**Security Note:** Keep your `cookies.txt` file private and never share it, as it contains your YouTube session data.

---

## Sharding for Large Bots (1000+ Servers)

When your bot reaches **1,000+ servers**, Discord **requires** you to use sharding to distribute the load across multiple processes. MusicMaker includes a fully automated sharding system powered by Discord.js's `ShardingManager`.

> 📚 **[Read the complete Sharding Guide](./SHARDING.md)** for detailed documentation, troubleshooting, and best practices.

### 🎯 What is Sharding?

Sharding splits your bot into multiple instances (shards), each handling a subset of servers:
- **Shard 0** might handle servers 1-1000
- **Shard 1** might handle servers 1001-2000
- And so on...

Discord automatically routes events to the correct shard based on server ID.

### 🚀 Quick Start with Sharding

#### Option 1: Interactive Launcher (Recommended)
```powershell
.\start.bat
```
Choose option **[2] Sharding Mode** when prompted.

#### Option 2: Direct Sharding Launch
```powershell
.\start-shard.bat
# or
node shard.js
```

#### Option 3: Normal Mode (< 1000 servers)
```powershell
node index.js
```

### ⚙️ Sharding Configuration

Configure sharding in `.env` or `config.js`:

```dotenv
# Sharding Settings
TOTAL_SHARDS=auto              # 'auto' = Discord calculates optimal count
SHARD_LIST=auto                # 'auto' = spawn all shards, or [0,1,2] for specific
SHARD_MODE=process             # 'process' (recommended) or 'worker'
SHARD_RESPAWN=true             # Auto-restart crashed shards
SHARD_SPAWN_DELAY=5500         # Delay between spawning shards (ms)
SHARD_SPAWN_TIMEOUT=30000      # Timeout for shard ready event (ms)
```

### 📊 Sharding Modes Explained

| Mode | Description | Best For |
| --- | --- | --- |
| **process** | Each shard runs in a separate Node.js process | Production (more stable, isolated memory) |
| **worker** | Each shard runs in a worker thread | Development (less memory, experimental) |

### 🔢 How Many Shards Do I Need?

Discord recommends: **1 shard per 1,000 servers**

| Servers | Recommended Shards |
| --- | --- |
| < 1,000 | No sharding needed (use `node index.js`) |
| 1,000 - 2,000 | 2 shards |
| 2,000 - 3,000 | 3 shards |
| 5,000+ | 5+ shards |

The bot automatically calculates the optimal count when `TOTAL_SHARDS=auto`.

### 📝 Sharding Best Practices

1. **Use `auto` for production** – Let Discord.js calculate the optimal shard count
2. **Respect spawn delays** – Discord rate-limits shard connections (5-5.5 seconds recommended)
3. **Monitor shard health** – The shard manager logs each shard's status in real-time
4. **Enable auto-respawn** – Crashed shards restart automatically
5. **Use process mode** – More stable than worker threads for production

### 🔍 Monitoring Shards

The bot displays detailed shard information:

```
[SHARD MANAGER] Launching shard 0...
[SHARD 0] ✅ Shard 0 is ready!
[SHARD 0] 🎵 Music bot serving 847 servers on this shard!
[SHARD 0] 🌐 Total servers across all shards: 1523

[SHARD MANAGER] Launching shard 1...
[SHARD 1] ✅ Shard 1 is ready!
[SHARD 1] 🎵 Music bot serving 676 servers on this shard!
```

### 🛠️ Advanced Sharding

#### Run Specific Shards
```dotenv
SHARD_LIST=[0,1,2]  # Only spawn shards 0, 1, and 2
```

#### Manual Shard Count
```dotenv
TOTAL_SHARDS=4  # Force 4 shards regardless of server count
```

#### Disable Auto-Respawn (Not Recommended)
```dotenv
SHARD_RESPAWN=false
```

### 🚨 Important Notes

- **Sharding is mandatory at 1,000+ servers** – Discord will reject connections without it
- **Commands work identically** – Users see no difference between sharded and non-sharded bots
- **Database remains local** – Each shard shares the same `database/languages.json` file
- **Voice connections are isolated** – Each shard manages its own voice connections

### 🆘 Sharding Troubleshooting

| Issue | Solution |
| --- | --- |
| "Cannot spawn more than X shards" | Discord limits shards based on server count. Use `auto` or contact Discord for limit increase. |
| Shards keep crashing | Check memory usage and increase spawn timeout (`SHARD_SPAWN_TIMEOUT`). |
| Commands not appearing | Wait for all shards to be ready. Global commands can take up to 1 hour to propagate. |
| Bot shows as offline | Ensure all shards are running. Check the shard manager logs. |

---

## Slash Commands & Controls

| Command | What it does |
| --- | --- |
| `/play <query>` | Smart-detects platform links or search keywords, queues playlists/albums, and spins up the control panel. |
| `/search <keywords>` | Presents a paginated selection menu of YouTube matches — choose with buttons. |
| `/nowplaying` | Drops the live embed again, including queue status, repeat/shuffle flags, and volume. |
| `/language` | Opens a flag button wall for instant localization (cached per guild). |
| `/help` | Gorgeous, localized feature tour + live stats and support links. |

### On-embed Controls

- **⏸️ / ▶️ Pause & Resume** – Auth-limited to DJs, admins, or the original requester.
- **⏭️ Skip** – Jumps to the next queued item (requires at least 1 upcoming track).
- **⏹️ Stop** – Clears queue, tears down voice, and locks the panel.
- **📋 Queue** – Renders the next 10 tracks with real-time progress bar.
- **🔀 Shuffle** – Randomizes the queue with guard rails (min. 2 tracks).
- **🔊 Volume** – Opens a modal allowing 0–100 input.
- **🔁 Loop** – Cycles through loop modes: Off → Track Repeat → Queue Repeat. Track mode replays the current song endlessly; Queue mode restarts the entire queue when finished.
- **🎲 Autoplay** – Toggles genre-based autoplay (Off → On with genre selection). When enabled, the bot automatically adds matching music from your selected genre when the queue ends, keeping the music flowing seamlessly.

All button sessions carry a short-lived signature, preventing stale interactions from previous queues.

---

## 🎲 Autoplay System

MusicMaker features an intelligent autoplay engine that keeps the music flowing when your queue runs out.

### How It Works

1. **Enable Autoplay** – Click the 🎲 Autoplay button on the now-playing embed
2. **Choose Your Genre** – Select from 20 carefully curated genres:
   - 🎵 Pop, Rock, Hip-Hop, Electronic, Jazz, Classical, Metal, Country
   - 🎸 R&B, Indie, Latin, K-Pop, Anime, Lo-Fi, Blues, Reggae
   - 🎹 Disco, Punk, Ambient, or Random (all genres)
3. **Sit Back & Enjoy** – When your queue ends, the bot automatically searches and queues relevant tracks

### Smart Content Filtering

The autoplay system includes sophisticated filters to ensure you only get actual music:

**Duration Limits:**
- ✅ Minimum: 30 seconds
- ✅ Maximum: 10 minutes (600 seconds)
- ❌ Filters out: Full movies, podcasts, long tutorials, DJ sets

**Keyword Blocking:**
Automatically skips content containing:
- Tutorial, lesson, course, how-to, guide
- Podcast, interview, talk, speech, lecture
- Review, unboxing, reaction, gameplay
- Full movie, full album, documentary
- ASMR, audiobook, story, meditation
- Mix, compilation (long-form content)

**Quality Checks:**
- Filters excessive emojis (spam/clickbait indicators)
- Blocks playlist-style titles with many brackets
- Prioritizes official music videos and verified uploads

### Genre-Specific Keywords

Each genre uses optimized search terms to find the best content:

| Genre | Search Strategy |
| --- | --- |
| **Anime** | "anime opening official", "anime songs official", "best anime op" |
| **K-Pop** | "kpop official mv", "kpop songs 2024", "korean music official" |
| **Lo-Fi** | "lofi hip hop music", "lofi beats official", "chill lofi music" |
| **Electronic** | "edm music", "electronic dance music", "house music official" |
| **Others** | Similarly optimized with "official", year markers, and quality indicators |

### Fallback Mechanism

If the first search yields no suitable tracks after filtering:
- Automatically retries with a different keyword from the genre pool
- Ensures you always get music, never silence
- Logs the entire process for transparency

### Local Caching Integration

All autoplay tracks leverage the same local cache system as manual plays:
- **Pre-downloaded** before playback starts
- **Zero buffering** during playback
- **Instant playback** from local storage
- **Automatic cleanup** when tracks finish

### Console Transparency

Watch the autoplay engine work in real-time:

```
🎲 Autoplay: Finding anime music...
✅ Autoplay: Added "YOASOBI - アイドル (Idol) [Official Music Video]" (244s)
⬇️ Pre-downloading: YOASOBI - アイドル (Idol) [Official Music Video]
📥 Downloading: YOASOBI - アイドル (Idol) [Official Music Video]
✅ Downloaded: YOASOBI - アイドル (Idol) [Official Music Video]
📊 File size: 3.87 MB
🎲 Autoplay: Now playing "YOASOBI - アイドル (Idol) [Official Music Video]"
```

### Usage Tips

- **Random Mode** – Can't decide? Select "Random" to get music from all genres
- **Queue Priority** – Manually added tracks always play before autoplay suggestions
- **Toggle Anytime** – Turn autoplay on/off at any point during playback
- **No Spam** – Only adds one track at a time as each song finishes

---

## 💾 Local Audio Cache System

MusicMaker eliminates playback interruptions by pre-downloading and caching all audio locally before streaming to Discord.

### Why Local Caching?

Traditional Discord bots stream directly from YouTube/Spotify/SoundCloud URLs, which causes:
- ❌ Random buffering and stuttering during playback
- ❌ Voice crackling when your ISP throttles streaming sites
- ❌ Stream failures during Discord voice server load spikes
- ❌ Quality drops when network conditions fluctuate

**MusicMaker's solution:**
- ✅ Downloads entire tracks to `audio_cache/` before playback
- ✅ Streams from local disk at consistent quality
- ✅ Zero dependency on external stream stability during playback
- ✅ Instant resume after voice reconnections

### How It Works

1. **Queue Detection** – When you add a track with `/play` or autoplay triggers
2. **Background Download** – Track downloads silently while previous song plays
3. **Smart Preloading** – Entire queue preloads in parallel for instant transitions
4. **Local Streaming** – FFmpeg streams the cached file to Discord voice
5. **Automatic Cleanup** – Files delete after playback to save disk space

### Console Output Example

```
⬇️ Pre-downloading: Song Title
📥 Downloading: Song Title
✅ Downloaded: Song Title
📊 File size: 4.23 MB
✅ Background download completed: Song Title
🎵 Streaming: Song Title
♻️ Reusing cached file: Song Title
▶️ Playing from cache: Song Title
🗑️ Deleted: track_abc123.opus
```

### Technical Details

**Cache Directory:**
- Location: `audio_cache/` (auto-created on first run)
- Format: Opus audio (`.opus` extension) for optimal Discord voice quality
- Naming: `track_[MD5 hash].opus` to prevent conflicts

**Download Process:**
- Uses `youtube-dl-exec` with best audio format selection
- FFmpeg transcodes to Opus for Discord's native codec
- Parallel downloads for multiple queued tracks
- Retry logic for failed downloads with fallback streaming

**Memory Management:**
- Files persist only during active playback
- Automatic deletion after track finishes
- Graceful cleanup on bot shutdown or errors
- Prevents disk bloat with aggressive pruning

**Performance Benefits:**
- **Zero mid-song buffering** – entire file ready before playback
- **Fast skip/seek** – local I/O is instant vs. network round-trip
- **Reliable autoplay** – pre-cached tracks guarantee smooth transitions
- **Network resilience** – download failures don't affect current playback

### Disk Space Considerations

Average track sizes:
- **3-5 minutes:** ~3-8 MB
- **Queue of 10 tracks:** ~30-80 MB peak usage
- **Auto-cleanup:** Disk usage drops to ~5-15 MB during playback

The cache system requires minimal disk space and automatically manages itself. For VPS deployments, ensure at least **500 MB free space** for comfortable operation with large queues.



---

## Language Support

Out-of-the-box translations (and matching flag buttons):

**Arabic**, **German**, **English**, **Spanish**, **French**, **Indonesian**, **Italian**, **Japanese**, **Dutch**, **Portuguese**, **Russian**, **Turkish**, **Traditional Chinese**, **Simplified Chinese**, **Hindi**, **Finnish**, **Danish**, **Norwegian**, **Polish**, **Korean**, **Swedish**

Add your own by copying `languages/en.json`, translating strings, and restarting the bot. The `LanguageManager` hot-loads every JSON file in `languages/`.

---

## Deployment Tips

- **Testing Guild** – Set `GUILD_ID` during development to avoid the global propagation delay. Remove it before production to reach every server automatically.
- **Process Manager** – Use `pm2`, `systemd`, or Docker to keep the bot alive and restart on crashes. Remember to persist the `database/languages.json` file if you containerize.
- **Logging** – Leverage the built-in Chalk-colored console output. Redirect stdout/stderr to log files for long-term monitoring.
- **Scaling** – The bot maintains one voice connection per guild. Horizontal scaling requires a shared state & queue (Redis, REST API, etc.) — future roadmap material.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Slash commands do not appear | Ensure `CLIENT_ID` is correct and the bot logged in successfully. For new deployments, invite the bot with `applications.commands` scope. |
| Spotify tracks return nothing | Verify `SPOTIFY_CLIENT_ID`/`SECRET` and that the app is approved for Spotify Web API. |
| Bot joins but plays silence | Confirm the host has outbound UDP open, and the voice channel permissions allow **Connect** and **Speak**. |
| Buttons stop working mid-song | Interactions expire after Discord's cache TTL or when a new session is generated. Use `/play` again to refresh the deck. |
| Lyrics button disabled or missing | The bot fetches from Genius first (web scraping or API), then LRCLIB. If both fail, no lyrics button appears. Check console for fetch errors. |
| Command language incorrect | Run `/language`, select your flag, and ensure `database/languages.json` is writable. |
| **YouTube bot detection error** | **YouTube requires bot verification via cookies. See [YouTube Cookie Setup](#youtube-cookie-setup) below for detailed instructions.** |

---

## Privacy & Legal

- [Privacy Policy](./PRIVACY_POLICY.md) – Exactly what data we store (guild ID + language preference) and how to request deletion.
- [Terms of Service](./TERMS_OF_SERVICE.md) – Acceptable use, liability limits, and contact info.
- [License](./LICENSE) – MIT. Use it privately or commercially — just keep the notice.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Run `npm install` to load dependencies.
3. Add or refine features (translation packs, UI tweaks, new providers).
4. Open a pull request with a clear description and screenshots/console logs where relevant.

Bug reports, feature ideas, and localization pull requests are all welcome. Swing by the [Support Server](https://discord.gg/ACJQzJuckW) to chat with the community.

---


Happy streaming, and keep the servers grooving! 🎧
