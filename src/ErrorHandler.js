const LanguageManager = require('./LanguageManager');

/**
 * Classifies a raw error into a known category and returns a localized,
 * user-friendly message with a fix suggestion.
 *
 * Usage:
 *   const msg = await ErrorHandler.getMessage(error, guildId);
 *   await interaction.editReply({ content: msg });
 */
class ErrorHandler {
    /**
     * Detect error category from an Error object or string.
     * @param {Error|string} error
     * @returns {string} category key
     */
    static classify(error) {
        const msg = (error instanceof Error ? error.message : String(error || '')).toLowerCase();

        // YouTube bot detection / requires login
        if (
            msg.includes('sign in to confirm') ||
            msg.includes('confirm you') ||
            msg.includes('bot detection') ||
            msg.includes('not a robot') ||
            msg.includes('please sign in') ||
            msg.includes('inappropriate') ||
            msg.includes('this video is unavailable') ||
            (msg.includes('youtube') && msg.includes('403'))
        ) return 'youtube_bot_detection';

        // Age-restricted
        if (
            msg.includes('age-restricted') ||
            msg.includes('age restricted') ||
            msg.includes('confirm your age') ||
            msg.includes('only available to registered users')
        ) return 'youtube_age_restricted';

        // Private / deleted / unavailable video
        if (
            msg.includes('private video') ||
            msg.includes('video unavailable') ||
            msg.includes('this video has been removed') ||
            msg.includes('no longer available') ||
            msg.includes('has been deleted') ||
            msg.includes('video is not available')
        ) return 'youtube_unavailable';

        // Geo-blocked
        if (
            msg.includes('not available in your country') ||
            msg.includes('geo') ||
            msg.includes('blocked in') ||
            msg.includes('region')
        ) return 'youtube_geo_blocked';

        // Rate limited
        if (
            msg.includes('429') ||
            msg.includes('too many requests') ||
            msg.includes('rate limit') ||
            msg.includes('quota')
        ) return 'rate_limited';

        // Spotify track not found on YouTube
        if (
            msg.includes('youtube equivalent not found') ||
            msg.includes('no youtube match') ||
            msg.includes('could not find youtube')
        ) return 'spotify_no_match';

        // No results
        if (
            msg.includes('no results') ||
            msg.includes('not found') ||
            msg.includes('no entries') ||
            msg.includes('no tracks')
        ) return 'no_results';

        // Network / connection errors
        if (
            msg.includes('econnreset') ||
            msg.includes('econnrefused') ||
            msg.includes('etimedout') ||
            msg.includes('fetch failed') ||
            msg.includes('socket hang up') ||
            msg.includes('network') ||
            msg.includes('connection refused') ||
            msg.includes('getaddrinfo')
        ) return 'network_error';

        // FFmpeg / stream processing
        if (
            msg.includes('ffmpeg') ||
            msg.includes('pipe') ||
            msg.includes('stream') ||
            msg.includes('audio') ||
            msg.includes('codec')
        ) return 'stream_failed';

        // Voice channel permissions
        if (
            msg.includes('missing access') ||
            msg.includes('missing permissions') ||
            msg.includes('voice_join') ||
            msg.includes('speak')
        ) return 'voice_no_permission';

        return 'unknown';
    }

    /**
     * Returns a localized, user-facing error embed text with fix instructions.
     * @param {Error|string} error
     * @param {string|null} guildId
     * @returns {Promise<string>}
     */
    static async getMessage(error, guildId = null) {
        const category = this.classify(error);
        const key = `errors.${category}`;

        if (guildId) {
            return await LanguageManager.getTranslation(guildId, key);
        }

        // Fallback: English directly from loaded languages
        return LanguageManager.getTranslationSync('en', key);
    }

    /**
     * Logs the real error to console with full detail, then returns the
     * user-facing message. Use this as a drop-in for catch blocks.
     * @param {Error|string} error
     * @param {string|null} guildId
     * @param {string} context  — e.g. 'play.js search', 'MusicPlayer.play'
     * @returns {Promise<string>}
     */
    static async handle(error, guildId = null, context = '') {
        const category = this.classify(error);
        console.error(`❌ [${context || 'ErrorHandler'}] [${category}] ${error?.message || error}`);
        return await this.getMessage(error, guildId);
    }
}

module.exports = ErrorHandler;
