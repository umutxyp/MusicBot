'use strict';

const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const env = (key, fallback = '') => {
    const value = process.env[key];
    return value === undefined || value.trim() === '' ? fallback : value.trim();
};

const int = (key, fallback, { min = -Infinity, max = Infinity } = {}) => {
    const parsed = Number.parseInt(env(key), 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
};

const bool = (key, fallback = false) => {
    const value = env(key).toLowerCase();
    if (!value) return fallback;
    return ['1', 'true', 'yes', 'on'].includes(value);
};

const list = (key) => env(key).split(',').map((item) => item.trim()).filter(Boolean);

const parseColor = (value) => {
    const hex = String(value).replace('#', '');
    const parsed = Number.parseInt(hex, 16);
    return /^[0-9a-f]{6}$/i.test(hex) && Number.isFinite(parsed) ? parsed : 0x5865f2;
};

const shardCount = () => {
    const value = env('TOTAL_SHARDS', 'auto');
    if (value === 'auto') return 'auto';
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 'auto';
};

const shardList = () => {
    const value = env('SHARD_LIST', 'auto');
    if (value === 'auto') return 'auto';
    const ids = value.split(',').map((id) => Number.parseInt(id, 10)).filter(Number.isInteger);
    return ids.length ? ids : 'auto';
};

const config = {
    root: path.join(__dirname, '..'),
    dataDir: path.resolve(path.join(__dirname, '..'), env('DATA_DIR', 'data')),
    debug: bool('DEBUG'),

    discord: {
        token: env('DISCORD_TOKEN'),
        clientId: env('CLIENT_ID'),
        guildId: env('GUILD_ID') || null,
    },

    bot: {
        status: env('STATUS', '/play'),
        color: parseColor(env('EMBED_COLOR', '#5865F2')),
        supportServer: env('SUPPORT_SERVER'),
        website: env('WEBSITE'),
        defaultLanguage: env('DEFAULT_LANGUAGE', 'en'),
        defaultVolume: int('DEFAULT_VOLUME', 100, { min: 1, max: 100 }),
        maxVolume: 100,
        maxQueueSize: int('MAX_QUEUE_SIZE', 500, { min: 1 }),
        maxPlaylistSize: int('MAX_PLAYLIST_SIZE', 200, { min: 1 }),
        leaveOnEmptyMs: int('LEAVE_ON_EMPTY', 60, { min: 0 }) * 1000,
        leaveOnFinishMs: int('LEAVE_ON_FINISH', 120, { min: 0 }) * 1000,
        panelRefreshMs: int('PANEL_REFRESH', 20, { min: 0 }) * 1000,
    },

    spotify: {
        clientId: env('SPOTIFY_CLIENT_ID'),
        clientSecret: env('SPOTIFY_CLIENT_SECRET'),
    },

    ytdlp: {
        path: env('YTDLP_PATH'),
        cookiesFile: env('COOKIES_FILE'),
        cookiesFromBrowser: env('COOKIES_FROM_BROWSER'),
        poToken: env('YOUTUBE_PO_TOKEN'),
        extractorArgs: env('YTDLP_EXTRACTOR_ARGS'),
        concurrency: int('YTDLP_CONCURRENCY', 4, { min: 1, max: 32 }),
        timeoutMs: int('YTDLP_TIMEOUT', 30, { min: 5 }) * 1000,
    },

    ffmpegPath: env('FFMPEG_PATH'),
    proxies: list('PROXY_URL'),

    sharding: {
        totalShards: shardCount(),
        shardList: shardList(),
        mode: env('SHARD_MODE', 'process') === 'worker' ? 'worker' : 'process',
        respawn: bool('SHARD_RESPAWN', true),
        spawnDelay: int('SHARD_SPAWN_DELAY', 5500, { min: 0 }),
        spawnTimeout: int('SHARD_SPAWN_TIMEOUT', 60000, { min: 5000 }),
    },
};

config.bot.invite = config.discord.clientId
    ? `https://discord.com/oauth2/authorize?client_id=${config.discord.clientId}&permissions=3230720&scope=bot%20applications.commands`
    : '';

module.exports = config;
module.exports.parseColor = parseColor;
