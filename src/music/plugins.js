'use strict';

const { ExtractorPlugin, PlayableExtractorPlugin, Playlist, Song, DisTubeError } = require('distube');
const config = require('../config');
const ytdlp = require('./ytdlp');
const { TTLCache } = require('../core/cache');
const log = require('../core/logger').createLogger('extractor');

const AUDIO_FORMAT = 'bestaudio[acodec=opus]/bestaudio/best';
const YOUTUBE_HOSTS = new Set([
    'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'www.youtu.be',
    'youtube-nocookie.com', 'www.youtube-nocookie.com',
]);
const VIDEO_ID = /^[\w-]{11}$/;

// Every song carries its guild id in metadata so proxy selection never depends on a cached member.
const guildIdOf = (holder) => holder?.metadata?.guildId || holder?.member?.guild?.id || null;

/**
 * Seconds until a googlevideo URL expires (minus a safety margin), capped to 4 hours.
 */
function streamTtl(url) {
    try {
        const expire = Number(new URL(url).searchParams.get('expire'));
        if (expire > 0) return Math.max(60_000, Math.min(4 * 3600_000, expire * 1000 - Date.now() - 30 * 60_000));
    } catch {
        // not a URL with an expiry
    }
    return 3600_000;
}

/**
 * Classify a YouTube URL: { type: 'video', id } | { type: 'playlist', id } | null.
 */
function parseYouTubeUrl(input) {
    let url;
    try {
        url = new URL(input);
    } catch {
        return null;
    }
    if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;

    const list = url.searchParams.get('list');
    let videoId = url.searchParams.get('v');
    if (url.hostname.endsWith('youtu.be')) videoId = url.pathname.slice(1).split('/')[0];
    const pathMatch = url.pathname.match(/^\/(?:shorts|live|embed|v)\/([\w-]{11})/);
    if (pathMatch) videoId = pathMatch[1];

    const hasVideo = Boolean(videoId && VIDEO_ID.test(videoId));
    // Auto-generated mixes (RD...) are endless; when a video is given, play just that video.
    const isMix = Boolean(list && list.startsWith('RD'));
    if (list && /^[\w-]+$/.test(list) && !(isMix && hasVideo)) return { type: 'playlist', id: list };
    if (hasVideo) return { type: 'video', id: videoId };
    return null;
}

const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
const thumbnailFor = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/**
 * Normalize a yt-dlp info object (full or flat entry) to the fields DisTube's Song wants.
 */
function youtubeInfo(info) {
    const id = info.id;
    const isLive = Boolean(info.is_live || info.live_status === 'is_live');
    return {
        source: 'youtube',
        playFromSource: true,
        id,
        name: info.title || info.fulltitle || id,
        url: VIDEO_ID.test(id || '') ? watchUrl(id) : info.webpage_url || info.url,
        isLive,
        duration: isLive ? 0 : Number(info.duration) || 0,
        thumbnail: VIDEO_ID.test(id || '') ? thumbnailFor(id) : info.thumbnail,
        uploader: {
            name: info.uploader || info.channel || undefined,
            url: info.uploader_url || info.channel_url || undefined,
        },
        views: info.view_count,
        likes: info.like_count,
        ageRestricted: Number(info.age_limit) >= 18,
    };
}

/**
 * Shared yt-dlp plumbing: stream URL cache keyed per proxy (stream URLs are IP-locked).
 */
class YtDlpBase {
    constructor(runner) {
        this.run = runner;
        this.streams = new TTLCache({ ttlMs: 3600_000, maxSize: 2000 });
    }

    streamKey(guildId, url) {
        return `${ytdlp.proxyFor(guildId) || 'direct'}|${url}`;
    }

    rememberStream(guildId, pageUrl, info) {
        if (info?.url && !info.entries) this.streams.set(this.streamKey(guildId, pageUrl), info.url, streamTtl(info.url));
    }

    async streamUrl(song, { priority = 'high' } = {}) {
        if (!song?.url) throw new DisTubeError('INVALID_SONG', 'Cannot get a stream URL without a song URL.');
        const guildId = guildIdOf(song);
        const key = this.streamKey(guildId, song.url);
        return this.streams.wrap(key, async () => {
            const info = await this.run(song.url, ['--no-playlist', '-f', AUDIO_FORMAT], { proxy: ytdlp.proxyFor(guildId), priority });
            if (!info?.url) throw new DisTubeError('NO_STREAM_URL', song.name || song.url);
            return info.url;
        }).then((url) => {
            this.streams.set(key, url, streamTtl(url));
            return url;
        });
    }
}

class YouTubePlugin extends ExtractorPlugin {
    constructor({ runner = ytdlp.runJson } = {}) {
        super();
        this.base = new YtDlpBase(runner);
        this.searches = new TTLCache({ ttlMs: 30 * 60_000, maxSize: 1000 });
        this.lastSearchError = null;
    }

    get run() {
        return this.base.run;
    }

    validate(url) {
        return parseYouTubeUrl(url) !== null;
    }

    async resolve(url, options = {}) {
        const parsed = parseYouTubeUrl(url);
        if (!parsed) throw new DisTubeError('NOT_SUPPORTED_URL');
        const guildId = guildIdOf(options);
        const proxy = ytdlp.proxyFor(guildId);

        if (parsed.type === 'playlist') {
            const info = await this.run(`https://www.youtube.com/playlist?list=${parsed.id}`, [
                '--flat-playlist', '--playlist-end', String(config.bot.maxPlaylistSize),
            ], { proxy });
            const songs = (info.entries || [])
                .filter((entry) => entry?.id && VIDEO_ID.test(entry.id) && entry.title !== '[Private video]' && entry.title !== '[Deleted video]')
                .map((entry) => new Song({ ...youtubeInfo(entry), plugin: this }, options));
            if (!songs.length) throw new DisTubeError('EMPTY_PLAYLIST');
            return new Playlist({
                source: 'youtube',
                songs,
                id: parsed.id,
                name: info.title || 'YouTube playlist',
                url: `https://www.youtube.com/playlist?list=${parsed.id}`,
                thumbnail: songs[0].thumbnail,
            }, options);
        }

        // One call returns metadata *and* the stream URL, so playback can start right away.
        const info = await this.run(watchUrl(parsed.id), ['--no-playlist', '-f', AUDIO_FORMAT], { proxy });
        const song = new Song({ ...youtubeInfo(info), plugin: this }, options);
        this.base.rememberStream(guildId, song.url, info);
        return song;
    }

    /**
     * Used by DisTube for text queries and for Spotify tracks (which are played from YouTube).
     * Returning null lets DisTube fall back to the next extractor (SoundCloud).
     */
    async searchSong(query, options = {}) {
        const guildId = guildIdOf(options);
        try {
            const info = await this.searchInfo(query, guildId);
            if (!info) return null;
            const song = new Song({ ...youtubeInfo(info), plugin: this }, options);
            this.base.rememberStream(guildId, song.url, info);
            return song;
        } catch (error) {
            this.lastSearchError = error;
            log.warn(`Search failed for "${query}": ${error.message}`);
            return null;
        }
    }

    searchInfo(query, guildId, { priority = 'high' } = {}) {
        const proxy = ytdlp.proxyFor(guildId);
        return this.searches.wrap(`${proxy || 'direct'}|${query.toLowerCase()}`, async () => {
            const result = await this.run(`ytsearch1:${query}`, ['-f', AUDIO_FORMAT], { proxy, priority });
            const info = result?.entries ? result.entries.find(Boolean) : result;
            return info?.id ? info : null;
        });
    }

    /**
     * Several results for /search (metadata only, fast flat extraction).
     */
    async search(query, limit = 5, guildId = null) {
        const result = await this.run(`ytsearch${limit}:${query}`, ['--flat-playlist'], { proxy: ytdlp.proxyFor(guildId) });
        return (result?.entries || []).filter((entry) => entry?.id && VIDEO_ID.test(entry.id)).map(youtubeInfo);
    }

    getStreamURL(song) {
        return this.base.streamUrl(song);
    }

    /**
     * Warm the caches for an upcoming song so it starts instantly.
     */
    async prefetch(song) {
        await this.base.streamUrl(song, { priority: 'low' });
    }

    async prefetchQuery(query, guildId) {
        const info = await this.searchInfo(query, guildId, { priority: 'low' });
        if (info) this.base.rememberStream(guildId, watchUrl(info.id), info);
    }

    async getRelatedSongs(song) {
        if (!VIDEO_ID.test(song?.id || '')) return [];
        const guildId = guildIdOf(song);
        const result = await this.run(`${watchUrl(song.id)}&list=RD${song.id}`, [
            '--flat-playlist', '--playlist-end', '15',
        ], { proxy: ytdlp.proxyFor(guildId), priority: 'low' });
        return (result?.entries || [])
            .filter((entry) => entry?.id && entry.id !== song.id && VIDEO_ID.test(entry.id))
            .filter((entry) => !entry.duration || (entry.duration >= 60 && entry.duration <= 900))
            .map((entry) => new Song({ ...youtubeInfo(entry), plugin: this }, { member: song.member, metadata: song.metadata }));
    }
}

/**
 * Fallback for every other site yt-dlp supports (Bandcamp, Vimeo, Twitch, ...). Must be the last plugin.
 */
class GenericPlugin extends PlayableExtractorPlugin {
    constructor({ runner = ytdlp.runJson } = {}) {
        super();
        this.base = new YtDlpBase(runner);
    }

    validate(url) {
        try {
            return ['http:', 'https:'].includes(new URL(url).protocol);
        } catch {
            return false;
        }
    }

    async resolve(url, options = {}) {
        const guildId = guildIdOf(options);
        const info = await this.base.run(url, [
            '--flat-playlist', '--playlist-end', String(config.bot.maxPlaylistSize), '-f', 'bestaudio/best',
        ], { proxy: ytdlp.proxyFor(guildId) });

        const toSong = (entry) => new Song({
            source: entry.extractor_key || entry.ie_key || entry.extractor || 'generic',
            playFromSource: true,
            id: String(entry.id ?? entry.url),
            name: entry.title || entry.id || entry.url,
            url: entry.webpage_url || entry.url,
            isLive: Boolean(entry.is_live),
            duration: entry.is_live ? 0 : Number(entry.duration) || 0,
            thumbnail: entry.thumbnail || entry.thumbnails?.at(-1)?.url,
            uploader: { name: entry.uploader || entry.channel, url: entry.uploader_url || entry.channel_url },
            ageRestricted: Number(entry.age_limit) >= 18,
            plugin: this,
        }, options);

        if (Array.isArray(info.entries)) {
            const songs = info.entries.filter((entry) => entry && (entry.webpage_url || entry.url)).map(toSong);
            if (!songs.length) throw new DisTubeError('EMPTY_PLAYLIST');
            return new Playlist({
                source: info.extractor_key || 'generic',
                songs,
                id: String(info.id ?? url),
                name: info.title || url,
                url: info.webpage_url || url,
                thumbnail: info.thumbnail || songs[0].thumbnail,
            }, options);
        }

        const song = toSong(info);
        this.base.rememberStream(guildId, song.url, info);
        return song;
    }

    getStreamURL(song) {
        return this.base.streamUrl(song);
    }

    async prefetch(song) {
        await this.base.streamUrl(song, { priority: 'low' });
    }

    getRelatedSongs() {
        return [];
    }
}

module.exports = { YouTubePlugin, GenericPlugin, parseYouTubeUrl, youtubeInfo, streamTtl, AUDIO_FORMAT };
