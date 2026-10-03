'use strict';

/**
 * Map an error from DisTube / yt-dlp / Discord to a translation key.
 */
const RULES = [
    [(code) => code === 'VOICE_FULL', 'ui.voice_full'],
    [(code) => code === 'VOICE_MISSING_PERMS', 'errors.voice_no_permission'],
    [(code) => code === 'VOICE_CONNECT_FAILED' || code === 'VOICE_RECONNECT_FAILED', 'musicplayer.failed_connect_voice'],
    [(code) => code === 'NON_NSFW', 'errors.youtube_age_restricted'],
    [(code) => code === 'NOT_SUPPORTED_URL' || code === 'NOT_SUPPORTED_SONG', 'ui.unsupported'],
    [(code) => code === 'EMPTY_PLAYLIST' || code === 'EMPTY_FILTERED_PLAYLIST', 'youtube.no_valid_tracks'],
    [(code) => code === 'NO_RESULT' || code === 'SOUNDCLOUD_PLUGIN_NO_RESULT', 'musicplayer.no_results_found'],
    [(code, text) => /sign in to confirm|not a bot|confirm you.re not/.test(text), 'errors.youtube_bot_detection'],
    [(code, text) => /age.?restrict|confirm your age|inappropriate for some users/.test(text), 'errors.youtube_age_restricted'],
    [(code, text) => /available in your country|geo.?restrict|blocked it in your country/.test(text), 'errors.youtube_geo_blocked'],
    [(code, text) => /\b429\b|too many requests|rate.?limit/.test(text), 'errors.rate_limited'],
    [(code, text) => /video unavailable|private video|has been removed|does not exist|is not available|no longer available/.test(text), 'errors.youtube_unavailable'],
    [(code, text) => /econnreset|etimedout|enotfound|eai_again|socket hang up|network|timed out/.test(text), 'errors.network_error'],
    [(code, text) => code === 'FFMPEG_EXITED' || code === 'NO_STREAM_URL' || code === 'CANNOT_GET_STREAM_URL' || /ffmpeg|403|forbidden/.test(text), 'errors.stream_failed'],
];

function errorKey(error) {
    const code = error?.errorCode || error?.code || '';
    const text = `${error?.message || ''} ${error?.stderr || ''}`.toLowerCase();
    for (const [test, key] of RULES) {
        if (test(String(code), text)) return key;
    }
    return 'errors.unknown';
}

const NOT_FOUND = new Set(['musicplayer.no_results_found', 'errors.unknown']);

/**
 * Translation key for an error. When a text search ended in "no results" only because YouTube
 * refused the request (and the SoundCloud fallback found nothing either), report YouTube's error.
 */
function describeError(error, { youtube, since = 0 } = {}) {
    const key = errorKey(error);
    if (NOT_FOUND.has(key) && youtube?.lastSearchError && youtube.lastSearchErrorAt >= since) {
        const cause = errorKey(youtube.lastSearchError);
        if (cause !== 'errors.unknown') return cause;
    }
    return key;
}

const HOST_HINTS = {
    'errors.youtube_bot_detection': 'YouTube is blocking this server ("Sign in to confirm you\'re not a bot"). Export YouTube cookies to cookies.txt and set COOKIES_FILE=./cookies.txt in .env (or YOUTUBE_PO_TOKEN / PROXY_URL). See README.md, section "YouTube: Sign in to confirm you\'re not a bot".',
    'errors.youtube_age_restricted': 'Age-restricted videos need a logged-in YouTube account. Set COOKIES_FILE=./cookies.txt in .env. See README.md.',
    'errors.rate_limited': 'A platform is rate limiting this server. If it keeps happening set COOKIES_FILE or PROXY_URL in .env. See README.md.',
};

/**
 * Instructions for the bot owner's console when an error needs a configuration change
 * (logged at most once every 10 minutes per kind).
 */
const lastHint = new Map();
function hostHint(key, now = Date.now()) {
    const hint = HOST_HINTS[key];
    if (!hint || now - (lastHint.get(key) || 0) < 10 * 60_000) return null;
    lastHint.set(key, now);
    return hint;
}

module.exports = { errorKey, describeError, hostHint };
