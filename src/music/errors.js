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

module.exports = { errorKey };
