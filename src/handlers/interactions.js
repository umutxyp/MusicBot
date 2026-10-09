'use strict';

const {
    LabelBuilder,
    MessageFlags,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');
const i18n = require('../core/i18n');
const actions = require('../music/actions');
const views = require('../ui/views');
const { checkVoice, say, IGNORED_CODES } = require('./guards');
const { playFromInteraction } = require('../commands/play');
const { searches } = require('../commands/search');
const { showLyrics, pages: lyricsPages } = require('../commands/lyrics');
const log = require('../core/logger').createLogger('interactions');

const { ID } = views;

/**
 * Payloads for interaction.update(): the ephemeral flag can't be changed on an existing message.
 */
const asUpdate = (payload) => ({ ...payload, flags: payload.flags & ~MessageFlags.Ephemeral });

function context(interaction) {
    return { client: interaction.client, manager: interaction.client.music, t: i18n.forInteraction(interaction) };
}

// ─── Panel controls ────────────────────────────────────────────────────

async function updatePanel(interaction, manager, queue) {
    await interaction.update(manager.panelPayload(queue));
    manager.adoptPanel(queue.id, interaction.message);
    manager.changed(queue, { refresh: false });
}

function volumeModal(t, volume) {
    return new ModalBuilder()
        .setCustomId(ID.volumeModal)
        .setTitle(t('buttonhandler.set_volume_title').slice(0, 45))
        .addLabelComponents(new LabelBuilder()
            .setLabel(t('buttonhandler.volume_label').slice(0, 45))
            .setTextInputComponent(new TextInputBuilder()
                .setCustomId(ID.volumeInput)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(3)
                .setValue(String(volume))));
}

async function handlePanel(interaction, ctx) {
    const { t, manager } = ctx;
    const guildId = interaction.guildId;
    const queue = manager.getQueue(guildId);

    // Old panels (previous session, replaced panel) are turned into a plain "ended" card.
    if (!queue?.songs.length || !manager.isCurrentPanel(guildId, interaction.message.id)) {
        return interaction.update(views.endedPanel(t, { title: t('musicmanager.playback_ended') }));
    }

    if (interaction.customId === ID.queue) {
        return interaction.reply(views.queueView(t, { current: queue.songs[0], upcoming: queue.songs.slice(1) }));
    }
    if (interaction.customId === ID.lyrics) {
        return showLyrics(interaction, ctx, queue.songs[0]);
    }

    const check = checkVoice(interaction, manager, t);
    if (check.error) return say(interaction, check.error);

    const run = (action) => actions.safely(action, t);
    switch (interaction.customId) {
        case ID.pause:
        case ID.loop:
        case ID.autoplay:
        case ID.shuffle:
        case ID.filter: {
            const outcome = await run(() => {
                if (interaction.customId === ID.pause) return actions.togglePause(queue, t);
                if (interaction.customId === ID.loop) return actions.setLoop(queue, t);
                if (interaction.customId === ID.autoplay) return actions.toggleAutoplay(queue, t);
                if (interaction.customId === ID.shuffle) return actions.shuffle(queue, t);
                return actions.setFilter(queue, t, interaction.values[0]);
            });
            if (!outcome.ok) return say(interaction, outcome.message);
            return updatePanel(interaction, manager, queue);
        }
        case ID.volume:
            return interaction.showModal(volumeModal(t, queue.volume));
        case ID.skip:
        case ID.previous: {
            await interaction.deferUpdate();
            const outcome = await run(() => (interaction.customId === ID.skip ? actions.skip(queue, t) : actions.previous(queue, t)));
            if (!outcome.ok) return interaction.followUp(views.notice(outcome.message));
            return null;
        }
        case ID.stop:
            await interaction.deferUpdate();
            return actions.stop(queue, t, manager);
        default:
            return null;
    }
}

async function handleVolumeModal(interaction, { t, manager }) {
    const check = checkVoice(interaction, manager, t);
    if (check.error) return say(interaction, check.error);
    const value = interaction.fields.getTextInputValue(ID.volumeInput).trim();
    const outcome = actions.setVolume(check.queue, t, /^\d+$/.test(value) ? Number(value) : NaN);
    if (!outcome.ok) return say(interaction, outcome.message);
    if (interaction.isFromMessage() && manager.isCurrentPanel(check.queue.id, interaction.message.id)) {
        return updatePanel(interaction, manager, check.queue);
    }
    manager.changed(check.queue);
    return say(interaction, outcome.message);
}

// ─── Views with pages ──────────────────────────────────────────────────

async function handleQueuePage(interaction, { t, manager }) {
    const queue = manager.getQueue(interaction.guildId);
    if (!queue?.songs.length) return interaction.update(asUpdate(views.notice(t('commands.nowplaying.no_track'))));
    const page = Number(interaction.customId.slice(ID.queuePage.length)) || 0;
    return interaction.update(asUpdate(views.queueView(t, { current: queue.songs[0], upcoming: queue.songs.slice(1), page })));
}

async function handleLyricsPage(interaction, { t }) {
    const [token, page] = interaction.customId.slice(ID.lyricsPage.length).split(':');
    const found = lyricsPages.get(token);
    if (!found) return interaction.update(asUpdate(views.notice(t('buttonhandler.lyrics_unavailable'))));
    return interaction.update(asUpdate(views.lyricsView(t, { ...found, token, page: Number(page) || 0 })));
}

async function handleSearchPick(interaction, ctx) {
    const { t } = ctx;
    const token = interaction.customId.slice(ID.search.length);
    const entry = searches.get(token);
    const song = entry?.results[Number(interaction.values[0])];
    if (!entry || entry.userId !== interaction.user.id || !song) {
        return interaction.update(asUpdate(views.notice(t('buttonhandler.search_expired'))));
    }
    await interaction.deferUpdate();
    return playFromInteraction(interaction, ctx, song.url);
}

async function handleLanguage(interaction, { t, manager }) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        return say(interaction, t('commands.language.permission_required_button'));
    }
    const code = interaction.values[0];
    await i18n.setGuildLanguage(interaction.guildId, code);
    const name = i18n.list().find((lang) => lang.code === code)?.name || code;
    manager.refreshPanel(interaction.guildId);
    return interaction.update(asUpdate(views.notice(t('commands.language.changed_desc', { language: name }))));
}

// ─── Router ────────────────────────────────────────────────────────────

async function route(interaction) {
    if (!interaction.inCachedGuild()) return null;
    const ctx = context(interaction);

    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        return command?.execute(interaction, ctx);
    }
    if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName);
        return command?.autocomplete?.(interaction, ctx);
    }
    if (interaction.isModalSubmit()) {
        if (interaction.customId === ID.volumeModal) return handleVolumeModal(interaction, ctx);
        return null;
    }
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        const id = interaction.customId;
        if (id.startsWith('m:')) return handlePanel(interaction, ctx);
        if (id.startsWith(ID.queuePage)) return handleQueuePage(interaction, ctx);
        if (id.startsWith(ID.lyricsPage)) return handleLyricsPage(interaction, ctx);
        if (id.startsWith(ID.search)) return handleSearchPick(interaction, ctx);
        if (id === ID.language) return handleLanguage(interaction, ctx);
    }
    return null;
}

async function onInteraction(interaction) {
    try {
        await route(interaction);
    } catch (error) {
        if (IGNORED_CODES.has(error?.code)) return;
        log.error(`Interaction ${interaction.commandName || interaction.customId || interaction.type} failed:`, error);
        if (interaction.isAutocomplete()) {
            await interaction.respond([]).catch(() => undefined);
            return;
        }
        const t = i18n.forInteraction(interaction);
        await say(interaction, t('buttonhandler.processing_error')).catch(() => undefined);
    }
}

module.exports = { onInteraction, route, asUpdate, volumeModal };
