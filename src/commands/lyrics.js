'use strict';

const { randomBytes } = require('node:crypto');
const { command } = require('./_shared');
const { say, respond } = require('../handlers/guards');
const { TTLCache } = require('../core/cache');
const { findLyrics } = require('../music/lyrics');
const views = require('../ui/views');

// token -> lyrics result, so page buttons keep showing the same song
const pages = new TTLCache({ ttlMs: 30 * 60_000, maxSize: 500 });

/**
 * Look up lyrics for a song (or a free-text query) and reply with the paginated view.
 */
async function showLyrics(interaction, { t }, target) {
    if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ flags: 'Ephemeral' });
    const lookup = typeof target === 'string' ? { name: target } : target;
    let found = null;
    try {
        found = await findLyrics(lookup);
    } catch {
        return say(interaction, t('buttonhandler.lyrics_error'));
    }
    if (!found) return say(interaction, `${t('buttonhandler.no_lyrics_found')}\n-# ${lookup.name}`);
    const token = randomBytes(6).toString('hex');
    pages.set(token, found);
    return respond(interaction, views.lyricsView(t, { ...found, token, page: 0 }));
}

module.exports = {
    category: 'playback',
    pages,
    showLyrics,
    data: command('lyrics', 'Show the lyrics of the current song or any song')
        .addStringOption((option) => option.setName('song').setDescription('Song to look up (defaults to the current song)').setMaxLength(200)),

    async execute(interaction, ctx) {
        const query = interaction.options.getString('song')?.trim();
        if (query) return showLyrics(interaction, ctx, query);
        const song = ctx.manager.getQueue(interaction.guildId)?.songs[0];
        if (!song) return say(interaction, ctx.t('commands.nowplaying.no_track'));
        return showLyrics(interaction, ctx, song);
    },
};
