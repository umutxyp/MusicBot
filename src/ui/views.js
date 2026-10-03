'use strict';

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
} = require('discord.js');
const config = require('../config');
const { formatDuration, progressBar, truncate, link, escapeMarkdown, safeUrl } = require('../core/format');

const V2 = MessageFlags.IsComponentsV2;
const EPHEMERAL_V2 = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral;

const FILTERS = ['bassboost', 'nightcore', 'vaporwave', '3d', 'karaoke', 'echo', 'surround', 'tremolo'];
const FILTER_LABELS = {
    bassboost: 'Bass Boost',
    nightcore: 'Nightcore',
    vaporwave: 'Vaporwave',
    '3d': '8D',
    karaoke: 'Karaoke',
    echo: 'Echo',
    surround: 'Surround',
    tremolo: 'Tremolo',
};

const QUEUE_PAGE_SIZE = 10;
const LYRICS_PAGE_SIZE = 2800;

const ID = {
    previous: 'm:prev',
    pause: 'm:pause',
    skip: 'm:skip',
    stop: 'm:stop',
    volume: 'm:vol',
    shuffle: 'm:shuffle',
    loop: 'm:loop',
    autoplay: 'm:auto',
    queue: 'm:queue',
    lyrics: 'm:lyrics',
    filter: 'm:filter',
    volumeModal: 'm:volmodal',
    volumeInput: 'volume',
    queuePage: 'q:',
    lyricsPage: 'ly:',
    search: 's:',
    language: 'lang:set',
};

const text = (content) => new TextDisplayBuilder().setContent(content);
const separator = (large = false) => new SeparatorBuilder()
    .setDivider(true)
    .setSpacing(large ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small);
const container = (color = config.bot.color) => new ContainerBuilder().setAccentColor(color);
const button = (customId, label, style = ButtonStyle.Secondary) => new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(truncate(label, 80))
    .setStyle(style);
const row = (...components) => new ActionRowBuilder().addComponents(...components);

/**
 * Section with a thumbnail when a valid image URL exists, plain text otherwise.
 */
function headline(c, content, thumbnail) {
    const image = safeUrl(thumbnail);
    if (image) {
        c.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(text(content))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(image)));
    } else {
        c.addTextDisplayComponents(text(content));
    }
}

/**
 * A short status message (ephemeral by default).
 */
function notice(message, { ephemeral = true, color } = {}) {
    return {
        components: [container(color).addTextDisplayComponents(text(truncate(message, 3900)))],
        flags: ephemeral ? EPHEMERAL_V2 : V2,
        allowedMentions: { parse: [] },
    };
}

const LOOP_KEYS = ['buttons.loop_off', 'buttons.loop_track', 'buttons.loop_queue'];

function loopLabel(t, mode) {
    return t(LOOP_KEYS[mode] || LOOP_KEYS[0]);
}

function filterLabel(t, name) {
    return name ? FILTER_LABELS[name] || name : t('ui.filter_none');
}

function requesterLine(t, song) {
    if (!song.user || song.user.bot) return t('ui.autoplay_added');
    return `${t('commands.nowplaying.requested_by')}: <@${song.user.id}>`;
}

/**
 * The now-playing panel. `state` is a plain object so it can be tested without Discord.
 */
function playerPanel(t, state) {
    const { song, paused, currentTime = 0, volume, repeatMode = 0, autoplay = false, filter = null, upcoming = [], upcomingDuration = 0 } = state;
    const c = container();

    const status = paused ? t('commands.nowplaying.status_paused') : t('commands.nowplaying.title');
    const meta = [song.uploader?.name ? escapeMarkdown(truncate(song.uploader.name, 60)) : null,
        song.isLive ? t('ui.live') : formatDuration(song.duration)].filter(Boolean).join(' · ');
    headline(c, `-# ${status}\n### ${link(song.name, song.url, 90)}\n${meta}`, song.thumbnail);

    if (!song.isLive && song.duration > 0) {
        const position = Math.min(currentTime, song.duration);
        c.addTextDisplayComponents(text(`\`${formatDuration(position)}\` ${progressBar(position, song.duration)} \`${formatDuration(song.duration)}\``));
    }

    const details = [
        requesterLine(t, song),
        t('commands.nowplaying.volume', { volume }),
        loopLabel(t, repeatMode),
        autoplay ? t('buttons.autoplay_on') : t('buttons.autoplay_off'),
        filter ? t('ui.filter', { filter: filterLabel(t, filter) }) : null,
    ].filter(Boolean);
    c.addTextDisplayComponents(text(`-# ${details.join(' · ')}`));

    const next = upcoming[0];
    const queueLine = next
        ? `${t('commands.nowplaying.next_song')}: ${link(next.name, next.url, 70)}\n-# ${t('commands.nowplaying.footer_more_songs', { count: upcoming.length })} · ${formatDuration(upcomingDuration)}`
        : `-# ${t('commands.nowplaying.footer_no_songs')}`;
    c.addTextDisplayComponents(text(queueLine));

    c.addSeparatorComponents(separator());
    c.addActionRowComponents(
        row(
            button(ID.previous, t('ui.previous')),
            button(ID.pause, paused ? t('buttons.resume') : t('buttons.pause'), ButtonStyle.Primary),
            button(ID.skip, t('buttons.skip')),
            button(ID.stop, t('buttons.stop'), ButtonStyle.Danger),
            button(ID.volume, t('buttons.volume')),
        ),
        row(
            button(ID.shuffle, t('buttons.shuffle')).setDisabled(upcoming.length < 2),
            button(ID.loop, loopLabel(t, repeatMode), repeatMode ? ButtonStyle.Success : ButtonStyle.Secondary),
            button(ID.autoplay, autoplay ? t('buttons.autoplay_on') : t('buttons.autoplay_off'), autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
            button(ID.queue, t('buttons.queue')),
            button(ID.lyrics, t('buttons.lyrics')),
        ),
        row(new StringSelectMenuBuilder()
            .setCustomId(ID.filter)
            .setPlaceholder(`${t('ui.filter_placeholder')}: ${filterLabel(t, filter)}`)
            .addOptions(
                { label: t('ui.filter_none'), value: 'none', default: !filter },
                ...FILTERS.map((name) => ({ label: FILTER_LABELS[name], value: name, default: filter === name })),
            )),
    );

    return { components: [c], flags: V2, allowedMentions: { parse: [] } };
}

/**
 * Panel after playback ended (queue finished, stopped, disconnected...). No controls.
 */
function endedPanel(t, { title, description, song } = {}) {
    const c = container();
    const lines = [`### ${title}`];
    if (description) lines.push(description);
    if (song) lines.push(`-# ${link(song.name, song.url, 90)}`);
    c.addTextDisplayComponents(text(lines.join('\n')));
    return { components: [c], flags: V2, allowedMentions: { parse: [] } };
}

function pager(prefix, page, pages, t) {
    return row(
        button(`${prefix}${page - 1}`, t('ui.back')).setDisabled(page <= 0),
        button(`${prefix}${page + 1}`, t('ui.next')).setDisabled(page >= pages - 1),
    );
}

/**
 * Paginated queue view.
 */
function queueView(t, { current, upcoming, page = 0 }) {
    const pages = Math.max(1, Math.ceil(upcoming.length / QUEUE_PAGE_SIZE));
    const safePage = Math.min(Math.max(0, page), pages - 1);
    const total = upcoming.reduce((sum, song) => sum + (song.duration || 0), current?.duration || 0);
    const c = container();

    const header = [`### ${t('buttons.queue')}`];
    if (current) header.push(`${t('buttonhandler.now_playing')}: ${link(current.name, current.url, 80)} · ${current.isLive ? t('ui.live') : formatDuration(current.duration)}`);
    c.addTextDisplayComponents(text(header.join('\n')));

    if (upcoming.length) {
        const start = safePage * QUEUE_PAGE_SIZE;
        const lines = upcoming.slice(start, start + QUEUE_PAGE_SIZE).map((song, index) =>
            `\`${String(start + index + 1).padStart(2, ' ')}.\` ${link(song.name, song.url, 70)} · ${song.isLive ? t('ui.live') : formatDuration(song.duration)}`);
        c.addSeparatorComponents(separator());
        c.addTextDisplayComponents(text(`**${t('buttonhandler.upcoming_songs', { count: upcoming.length })}**\n${lines.join('\n')}`));
    } else {
        c.addTextDisplayComponents(text(`-# ${t('commands.nowplaying.footer_no_songs')}`));
    }

    c.addTextDisplayComponents(text(`-# ${t('buttonhandler.total_songs', { count: upcoming.length + (current ? 1 : 0) })} · ${formatDuration(total)} · ${t('ui.page', { page: safePage + 1, pages })}`));
    if (pages > 1) c.addActionRowComponents(pager(ID.queuePage, safePage, pages, t));
    return { components: [c], flags: EPHEMERAL_V2, allowedMentions: { parse: [] } };
}

function splitLyrics(lyrics) {
    const pages = [];
    let current = '';
    for (const paragraph of String(lyrics).split(/\n{2,}/)) {
        const block = paragraph.trim();
        if (!block) continue;
        if (current && current.length + block.length + 2 > LYRICS_PAGE_SIZE) {
            pages.push(current);
            current = '';
        }
        if (block.length > LYRICS_PAGE_SIZE) {
            for (let i = 0; i < block.length; i += LYRICS_PAGE_SIZE) pages.push(block.slice(i, i + LYRICS_PAGE_SIZE));
            continue;
        }
        current = current ? `${current}\n\n${block}` : block;
    }
    if (current) pages.push(current);
    return pages.length ? pages : [''];
}

function lyricsView(t, { title, artist, lyrics, source, token, page = 0 }) {
    const pages = splitLyrics(lyrics);
    const safePage = Math.min(Math.max(0, page), pages.length - 1);
    const c = container();
    const subtitle = [escapeMarkdown(truncate(title, 80)), artist ? escapeMarkdown(truncate(artist, 60)) : null].filter(Boolean).join(' · ');
    c.addTextDisplayComponents(text(`### ${t('buttonhandler.lyrics_title')}\n-# ${subtitle}`));
    c.addSeparatorComponents(separator());
    c.addTextDisplayComponents(text(escapeMarkdown(pages[safePage]).replace(/^([#-])/gm, '\\$1')));
    const footer = [source ? `${source}` : null, pages.length > 1 ? t('ui.page', { page: safePage + 1, pages: pages.length }) : null].filter(Boolean);
    if (footer.length) c.addTextDisplayComponents(text(`-# ${footer.join(' · ')}`));
    if (pages.length > 1 && token) c.addActionRowComponents(pager(`${ID.lyricsPage}${token}:`, safePage, pages.length, t));
    return { components: [c], flags: EPHEMERAL_V2, allowedMentions: { parse: [] } };
}

function searchView(t, { query, results, token }) {
    const c = container();
    const lines = results.map((song, index) =>
        `\`${index + 1}.\` ${link(song.name, song.url, 70)}\n-# ${[song.uploader?.name ? escapeMarkdown(truncate(song.uploader.name, 40)) : null, song.isLive ? t('ui.live') : formatDuration(song.duration)].filter(Boolean).join(' · ')}`);
    c.addTextDisplayComponents(text(`### ${t('commands.search.title', { query: escapeMarkdown(truncate(query, 80)) })}\n${lines.join('\n')}`));
    c.addSeparatorComponents(separator());
    c.addActionRowComponents(row(new StringSelectMenuBuilder()
        .setCustomId(`${ID.search}${token}`)
        .setPlaceholder(truncate(t('commands.search.select_description'), 150))
        .addOptions(results.map((song, index) => ({
            label: truncate(`${index + 1}. ${song.name}`, 100),
            description: truncate([song.uploader?.name, song.isLive ? t('ui.live') : formatDuration(song.duration)].filter(Boolean).join(' · '), 100),
            value: String(index),
        })))));
    return { components: [c], flags: EPHEMERAL_V2, allowedMentions: { parse: [] } };
}

function helpView(t, { commands, stats }) {
    const c = container();
    c.addTextDisplayComponents(text(`### ${t('commands.help.title')}\n${t('commands.help.main_description')}`));
    c.addSeparatorComponents(separator());
    const lines = commands.map((command) => `</${command.name}:${command.id || '0'}> ${command.description}`);
    const plain = commands.map((command) => `\`/${command.name}\` ${command.description}`);
    c.addTextDisplayComponents(text(`**${t('commands.help.commands_title')}**\n${(commands.every((command) => command.id) ? lines : plain).join('\n')}`));
    if (stats) {
        c.addSeparatorComponents(separator());
        c.addTextDisplayComponents(text(`-# ${[
            t('commands.help.stats_servers', { count: stats.servers }),
            t('commands.help.stats_active', { count: stats.active }),
            t('commands.help.stats_uptime', { time: stats.uptime }),
            `${stats.ping} ms`,
        ].join(' · ')}`));
    }
    const links = [
        config.bot.supportServer && [t('commands.help.button_support'), config.bot.supportServer],
        config.bot.website && [t('commands.help.button_website'), config.bot.website],
        config.bot.invite && [t('ui.invite'), config.bot.invite],
    ].filter((item) => item && safeUrl(item[1]));
    if (links.length) {
        c.addActionRowComponents(row(...links.map(([label, url]) => new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(label).setURL(url))));
    }
    return { components: [c], flags: EPHEMERAL_V2, allowedMentions: { parse: [] } };
}

function languageView(t, { languages, current }) {
    const c = container();
    const currentName = languages.find((lang) => lang.code === current)?.name || current;
    c.addTextDisplayComponents(text(`### ${t('commands.language.title')}\n${t('commands.language.current')}: **${currentName}**`));
    c.addActionRowComponents(row(new StringSelectMenuBuilder()
        .setCustomId(ID.language)
        .setPlaceholder(truncate(t('commands.language.select'), 150))
        .addOptions(languages.slice(0, 25).map((lang) => ({ label: lang.name, value: lang.code, default: lang.code === current })))));
    return { components: [c], flags: EPHEMERAL_V2, allowedMentions: { parse: [] } };
}

module.exports = {
    ID,
    FILTERS,
    FILTER_LABELS,
    V2,
    EPHEMERAL_V2,
    QUEUE_PAGE_SIZE,
    notice,
    playerPanel,
    endedPanel,
    queueView,
    lyricsView,
    searchView,
    helpView,
    languageView,
    splitLyrics,
    loopLabel,
    filterLabel,
};
