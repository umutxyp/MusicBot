'use strict';

const { Playlist } = require('distube');
const config = require('../config');
const i18n = require('../core/i18n');
const { command } = require('./_shared');
const { checkVoice, panelChannel, say } = require('../handlers/guards');
const { choices } = require('../music/suggest');
const log = require('../core/logger').createLogger('play');

/**
 * Shared by /play and the /search menu.
 */
async function playFromInteraction(interaction, ctx, query, { next = false } = {}) {
    const { t, manager } = ctx;
    const check = checkVoice(interaction, manager, t, { requireQueue: false, join: true });
    if (check.error) return say(interaction, check.error);

    const startedAt = Date.now();
    try {
        const outcome = await manager.play({
            voiceChannel: check.channel,
            textChannel: panelChannel(interaction),
            member: interaction.member,
            query,
            position: next ? 1 : 0,
        });
        const { resolved } = outcome;
        let message;
        if (resolved instanceof Playlist) {
            message = `${t('commands.play.playlist_success', { count: resolved.songs.length })}\n-# ${resolved.name}`;
            if (outcome.truncated) message += `\n-# ${t('ui.playlist_truncated', { max: config.bot.maxQueueSize })}`;
        } else if (outcome.started) {
            message = t('commands.play.track_started', { title: resolved.name });
        } else {
            message = t('commands.play.track_queued', { title: resolved.name, position: outcome.position });
        }
        const first = resolved instanceof Playlist ? null : resolved;
        if (first?.fallbackFrom) message += `\n-# ${t('ui.fallback_soundcloud')}`;
        return say(interaction, message);
    } catch (error) {
        if (error?.errorCode === 'QUEUE_FULL') return say(interaction, t('ui.queue_full', { max: config.bot.maxQueueSize }));
        const key = manager.explainError(error, startedAt);
        if (key === 'errors.unknown') log.error(`Failed to play "${query}":`, error);
        else log.warn(`Failed to play "${query}": ${error.message}`);
        return say(interaction, t(key));
    }
}

module.exports = {
    category: 'playback',
    data: command('play', 'Play a song or playlist from YouTube, Spotify, SoundCloud or a link')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('Song name or link')
            .setDescriptionLocalizations(i18n.localizations('commands.play.query_description'))
            .setRequired(true)
            .setMaxLength(1000)
            .setAutocomplete(true))
        .addBooleanOption((option) => option
            .setName('next')
            .setDescription('Play it right after the current song')),

    async execute(interaction, ctx) {
        await interaction.deferReply({ flags: 'Ephemeral' });
        return playFromInteraction(interaction, ctx, interaction.options.getString('query', true).trim(), {
            next: interaction.options.getBoolean('next') ?? false,
        });
    },

    async autocomplete(interaction) {
        await interaction.respond(await choices(interaction.options.getFocused()));
    },

    playFromInteraction,
};
