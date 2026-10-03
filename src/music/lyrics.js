'use strict';

const { TTLCache } = require('../core/cache');
const log = require('../core/logger').createLogger('lyrics');

const API = 'https://lrclib.net/api';
const cache = new TTLCache({ ttlMs: 6 * 3600_000, maxSize: 500 });

/**
 * Remove the usual video-title noise: "(Official Video)", "[Lyrics]", "ft. X", "Artist - Title"...
 */
function cleanTitle(title = '', artist = '') {
    let value = String(title)
        .replace(/\[[^\]]*\]|\([^)]*\)|【[^】]*】/g, ' ')
        .replace(/\b(official|music|lyric|lyrics|audio|video|visualizer|hd|4k|mv|remastered)\b/gi, ' ')
        .replace(/\s(ft|feat)\.?\s.*$/i, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    let guessedArtist = String(artist || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
    const dash = value.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    if (dash) {
        guessedArtist = dash[1].trim();
        value = dash[2].trim();
    }
    return { title: value || String(title).trim(), artist: guessedArtist };
}

async function request(path, params) {
    const url = `${API}${path}?${new URLSearchParams(params)}`;
    const response = await fetch(url, {
        headers: { 'User-Agent': 'MusicBot (https://github.com/umutxyp/musicbot)' },
        signal: AbortSignal.timeout(8000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`LRCLIB responded with ${response.status}`);
    return response.json();
}

function pickBest(results, duration) {
    const withLyrics = (results || []).filter((item) => item?.plainLyrics && !item.instrumental);
    if (!withLyrics.length) return null;
    if (!duration) return withLyrics[0];
    return withLyrics.reduce((best, item) =>
        Math.abs((item.duration || 0) - duration) < Math.abs((best.duration || 0) - duration) ? item : best);
}

/**
 * Find plain lyrics for a song. Returns { title, artist, lyrics, source } or null.
 */
async function findLyrics(song) {
    const { title, artist } = cleanTitle(song?.name, song?.uploader?.name);
    if (!title) return null;
    const key = `${title}|${artist}`.toLowerCase();

    return cache.wrap(key, async () => {
        try {
            let results = artist ? await request('/search', { track_name: title, artist_name: artist }) : null;
            if (!results?.length) results = await request('/search', { q: [artist, title].filter(Boolean).join(' ') });
            const best = pickBest(results, song?.duration);
            if (!best) return false;
            return { title: best.trackName || title, artist: best.artistName || artist, lyrics: best.plainLyrics.trim(), source: 'LRCLIB' };
        } catch (error) {
            log.warn(`Lookup failed for "${title}": ${error.message}`);
            throw error;
        }
    }, 6 * 3600_000).then((value) => value || null);
}

module.exports = { findLyrics, cleanTitle, pickBest };
