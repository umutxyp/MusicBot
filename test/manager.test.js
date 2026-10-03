'use strict';

process.env.LEAVE_ON_EMPTY = '1';
process.env.PANEL_REFRESH = '0';
process.env.MAX_QUEUE_SIZE = '5';
const { makeSong, fakeMember, ids } = require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const { Client, Collection, GatewayIntentBits, MessageFlags } = require('discord.js');
const { Playlist, RepeatMode } = require('distube');
const { MusicManager } = require('../src/music/manager');
const { route } = require('../src/handlers/interactions');
const { loadCommands } = require('../src/commands');
const views = require('../src/ui/views');

function setup() {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
    client.user = { id: ids.bot };
    const manager = new MusicManager(client);
    clearInterval(manager.saveTimer);
    client.music = manager;
    client.commands = loadCommands();
    return { client, manager };
}

function fakeChannel() {
    const channel = { id: ids.text, lastMessageId: null, sent: [], deleted: [] };
    let n = 0;
    channel.send = async (payload) => {
        const message = {
            id: `m${++n}`, channelId: channel.id, payload, edits: [],
            edit: async (p) => { message.edits.push(p); return message; },
            delete: async () => { channel.deleted.push(message.id); },
        };
        channel.sent.push(message);
        channel.lastMessageId = message.id;
        return message;
    };
    return channel;
}

function fakeQueue(songs, textChannel = fakeChannel()) {
    const queue = {
        id: ids.guild, songs, previousSongs: [], textChannel, paused: false, stopped: false, volume: 80,
        repeatMode: 0, autoplay: false, currentTime: 10, filters: { names: [], size: 0 },
        voiceChannel: { id: ids.voice }, calls: [],
        async pause() { queue.paused = true; queue.calls.push('pause'); },
        async resume() { queue.paused = false; queue.calls.push('resume'); },
        async stop() { queue.stopped = true; queue.calls.push('stop'); },
        setVolume(v) { queue.volume = v; },
        toggleAutoplay() { queue.autoplay = !queue.autoplay; return queue.autoplay; },
    };
    return queue;
}

test('play() joins the voice channel while the song is being resolved', async () => {
    const { manager } = setup();
    const events = [];
    const song = makeSong(1);
    manager.distube.voices.join = async () => { events.push('join:start'); await new Promise((r) => setTimeout(r, 30)); events.push('join:end'); };
    manager.distube.handler.resolve = async () => { events.push('resolve:start'); await new Promise((r) => setTimeout(r, 30)); events.push('resolve:end'); return song; };
    manager.distube.play = async (vc, resolved, options) => { events.push('play'); assert.equal(resolved, song); assert.equal(options.metadata.requesterId, ids.user); };
    const voiceChannel = { guild: { id: ids.guild } };
    const outcome = await manager.play({ voiceChannel, textChannel: undefined, member: fakeMember(), query: 'x' });
    assert.deepEqual(events.slice(0, 2).sort(), ['join:start', 'resolve:start']);
    assert.equal(events.at(-1), 'play');
    assert.equal(outcome.started, true);
});

test('play() truncates playlists to the queue capacity and refuses a full queue', async () => {
    const { manager } = setup();
    const existing = fakeQueue([makeSong(1), makeSong(2)]);
    manager.getQueue = () => existing;
    const playlist = new Playlist({ source: 'youtube', songs: Array.from({ length: 10 }, (_, i) => makeSong(i + 10)), name: 'pl' });
    manager.distube.handler.resolve = async () => playlist;
    let played;
    manager.distube.play = async (vc, resolved) => { played = resolved; };
    const outcome = await manager.play({ voiceChannel: { guild: { id: ids.guild } }, member: fakeMember(), query: 'x' });
    assert.equal(outcome.truncated, true);
    assert.equal(played.songs.length, 3);
    existing.songs.push(makeSong(3), makeSong(4), makeSong(5));
    await assert.rejects(manager.play({ voiceChannel: { guild: { id: ids.guild } }, member: fakeMember(), query: 'x' }), (e) => e.errorCode === 'QUEUE_FULL');
});

test('play() surfaces resolve errors and voice join errors', async () => {
    const { manager } = setup();
    manager.distube.voices.join = async () => undefined;
    manager.distube.handler.resolve = async () => { throw new Error('no results'); };
    await assert.rejects(manager.play({ voiceChannel: { guild: { id: ids.guild } }, member: fakeMember(), query: 'x' }), /no results/);
    manager.distube.voices.join = async () => { throw new Error('VOICE_CONNECT_FAILED'); };
    manager.distube.handler.resolve = async () => makeSong(1);
    await assert.rejects(manager.play({ voiceChannel: { guild: { id: ids.guild } }, member: fakeMember(), query: 'x' }), /VOICE_CONNECT_FAILED/);
});

test('prefetchNext warms the next song (direct and Spotify-style)', async () => {
    const { manager } = setup();
    const calls = [];
    const direct = makeSong(2, { plugin: { prefetch: async (s) => calls.push(`prefetch:${s.id}`) } });
    const queue = fakeQueue([makeSong(1), direct]);
    manager.prefetchNext(queue);
    const info = makeSong(3, { playFromSource: false, plugin: { createSearchQuery: (s) => `${s.name} ${s.uploader.name}` } });
    manager.youtube.prefetchQuery = async (query, guildId) => calls.push(`query:${query}:${guildId}`);
    manager.prefetchNext(fakeQueue([makeSong(1), info]));
    const looping = fakeQueue([makeSong(1), direct]);
    looping.repeatMode = RepeatMode.SONG;
    manager.prefetchNext(looping);
    await new Promise((r) => setImmediate(r));
    assert.deepEqual(calls, [`prefetch:${direct.id}`, `query:Song 3 Artist 3:${ids.guild}`]);
});

test('panel is sent once, edited in place while it is the last message, re-posted otherwise', async () => {
    const { manager } = setup();
    const queue = fakeQueue([makeSong(1), makeSong(2)]);
    manager.client.guilds.cache.set(ids.guild, { id: ids.guild, preferredLocale: 'en-US' });
    await manager.sendPanel(queue);
    const channel = queue.textChannel;
    assert.equal(channel.sent.length, 1);
    assert.ok(channel.sent[0].payload.flags & MessageFlags.IsComponentsV2);
    await manager.sendPanel(queue);
    assert.equal(channel.sent.length, 1);
    assert.equal(channel.sent[0].edits.length, 1);
    channel.lastMessageId = 'someone-else';
    await manager.sendPanel(queue);
    assert.equal(channel.sent.length, 2);
    assert.deepEqual(channel.deleted, ['m1']);
    assert.ok(manager.isCurrentPanel(ids.guild, 'm2'));
    await manager.endPanel(ids.guild, { titleKey: 'musicplayer.queue_completed' });
    assert.equal(manager.state(ids.guild).panel, null);
    assert.equal(channel.sent[1].edits.at(-1).components.length, 1);
});

test('concurrent panel sends never create duplicate panels', async () => {
    const { manager } = setup();
    const queue = fakeQueue([makeSong(1)]);
    await Promise.all([manager.sendPanel(queue), manager.sendPanel(queue), manager.sendPanel(queue)]);
    assert.equal(queue.textChannel.sent.length, 1);
});

test('empty voice channel: pause, resume when someone returns, leave after the timeout', async () => {
    const { manager } = setup();
    const queue = fakeQueue([makeSong(1)]);
    manager.getQueue = () => (queue.stopped ? undefined : queue);
    let left = 0;
    manager.distube.voices.leave = () => { left++; };
    const voiceStates = new Collection();
    const guild = { id: ids.guild, members: { me: { voice: { channelId: ids.voice } } }, voiceStates: { cache: voiceStates } };
    voiceStates.set(ids.bot, { id: ids.bot, channelId: ids.voice, member: fakeMember(ids.bot, true) });
    voiceStates.set('otherbot', { id: 'otherbot', channelId: ids.voice, member: fakeMember('otherbot', true) });

    await manager.handleVoiceStateUpdate({ guild }, { guild });
    assert.deepEqual(queue.calls, ['pause']);
    voiceStates.set(ids.user, { id: ids.user, channelId: ids.voice, member: null });
    await manager.handleVoiceStateUpdate({ guild }, { guild });
    assert.deepEqual(queue.calls, ['pause', 'resume']);

    queue.paused = true; // paused by a user: must stay paused after people come back
    voiceStates.delete(ids.user);
    await manager.handleVoiceStateUpdate({ guild }, { guild });
    voiceStates.set(ids.user, { id: ids.user, channelId: ids.voice, member: fakeMember() });
    await manager.handleVoiceStateUpdate({ guild }, { guild });
    assert.equal(queue.paused, true);

    voiceStates.delete(ids.user);
    await manager.handleVoiceStateUpdate({ guild }, { guild });
    await new Promise((r) => setTimeout(r, 1200));
    assert.equal(queue.stopped, true);
    assert.equal(left, 1);
});

// ─── Interactions ─────────────────────────────────────────────────────

function fakeInteraction(client, overrides = {}) {
    const replies = [];
    const voiceChannel = { id: ids.voice };
    const interaction = {
        client,
        guildId: ids.guild,
        user: { id: ids.user },
        guild: { id: ids.guild, preferredLocale: 'en-US', members: { me: { voice: { channelId: ids.voice } } } },
        member: { id: ids.user, voice: { channel: voiceChannel } },
        memberPermissions: { has: () => false },
        replied: false,
        deferred: false,
        replies,
        inCachedGuild: () => true,
        isChatInputCommand: () => false,
        isAutocomplete: () => false,
        isModalSubmit: () => false,
        isButton: () => true,
        isStringSelectMenu: () => false,
        isFromMessage: () => true,
        reply: async (p) => { interaction.replied = true; replies.push(['reply', p]); },
        update: async (p) => { interaction.replied = true; replies.push(['update', p]); },
        deferUpdate: async () => { interaction.deferred = true; replies.push(['deferUpdate']); },
        deferReply: async () => { interaction.deferred = true; replies.push(['deferReply']); },
        editReply: async (p) => { replies.push(['editReply', p]); },
        followUp: async (p) => { replies.push(['followUp', p]); },
        showModal: async (m) => { replies.push(['modal', m]); },
        ...overrides,
    };
    return interaction;
}

async function withPanel() {
    const { client, manager } = setup();
    const queue = fakeQueue([makeSong(1), makeSong(2), makeSong(3)]);
    manager.getQueue = () => queue;
    await manager.sendPanel(queue);
    const message = queue.textChannel.sent[0];
    return { client, manager, queue, message };
}

test('pause button updates the panel in place through the interaction', async () => {
    const { client, queue, message } = await withPanel();
    const interaction = fakeInteraction(client, { customId: views.ID.pause, message });
    await route(interaction);
    assert.equal(queue.paused, true);
    assert.equal(interaction.replies[0][0], 'update');
    assert.ok(interaction.replies[0][1].flags & MessageFlags.IsComponentsV2);
    assert.match(JSON.stringify(interaction.replies[0][1].components.map((c) => c.toJSON())), /"Resume"/);
});

test('buttons on an old panel turn it into an ended card', async () => {
    const { client, queue } = await withPanel();
    const interaction = fakeInteraction(client, { customId: views.ID.pause, message: { id: 'old' } });
    await route(interaction);
    assert.equal(queue.paused, false);
    assert.equal(interaction.replies[0][0], 'update');
    assert.match(JSON.stringify(interaction.replies[0][1].components[0].toJSON()), /Music Ended/);
});

test('users outside the bot voice channel cannot control playback', async () => {
    const { client, queue, message } = await withPanel();
    const interaction = fakeInteraction(client, { customId: views.ID.skip, message, member: { id: ids.user, voice: { channel: { id: 'elsewhere' } } } });
    await route(interaction);
    assert.equal(queue.paused, false);
    assert.equal(interaction.replies[0][0], 'reply');
    assert.ok(interaction.replies[0][1].flags & MessageFlags.Ephemeral);
    assert.match(JSON.stringify(interaction.replies[0][1].components[0].toJSON()), /same voice channel/);
});

test('volume button opens a modal; modal submit validates and updates the panel', async () => {
    const { client, queue, message } = await withPanel();
    const open = fakeInteraction(client, { customId: views.ID.volume, message });
    await route(open);
    assert.equal(open.replies[0][0], 'modal');
    assert.equal(open.replies[0][1].toJSON().components[0].component.value, '80');

    const submit = (value) => fakeInteraction(client, {
        customId: views.ID.volumeModal, message, isButton: () => false, isModalSubmit: () => true,
        fields: { getTextInputValue: () => value },
    });
    const bad = submit('abc');
    await route(bad);
    assert.equal(bad.replies[0][0], 'reply');
    assert.equal(queue.volume, 80);
    const good = submit('35');
    await route(good);
    assert.equal(queue.volume, 35);
    assert.equal(good.replies[0][0], 'update');
});

test('queue button replies with an ephemeral queue view', async () => {
    const { client, message } = await withPanel();
    const interaction = fakeInteraction(client, { customId: views.ID.queue, message });
    await route(interaction);
    assert.equal(interaction.replies[0][0], 'reply');
    assert.ok(interaction.replies[0][1].flags & MessageFlags.Ephemeral);
});

test('language menu requires Manage Server', async () => {
    const { client } = await withPanel();
    const interaction = fakeInteraction(client, { customId: views.ID.language, values: ['tr'], isButton: () => false, isStringSelectMenu: () => true });
    await route(interaction);
    assert.match(JSON.stringify(interaction.replies[0][1].components[0].toJSON()), /Manage Server/);
    const allowed = fakeInteraction(client, { customId: views.ID.language, values: ['tr'], isButton: () => false, isStringSelectMenu: () => true, memberPermissions: { has: () => true } });
    await route(allowed);
    assert.equal(allowed.replies[0][0], 'update');
    assert.match(JSON.stringify(allowed.replies[0][1].components[0].toJSON()), /Türkçe/);
});

test('slash commands without a queue answer with a friendly message', async () => {
    const { client, manager } = setup();
    manager.getQueue = () => undefined;
    for (const name of ['skip', 'pause', 'queue', 'nowplaying', 'volume']) {
        const interaction = fakeInteraction(client, {
            commandName: name, isButton: () => false, isChatInputCommand: () => true,
            options: { getInteger: () => 50, getString: () => null },
        });
        await route(interaction);
        assert.equal(interaction.replies.length, 1, name);
        assert.ok(interaction.replies[0][1].flags & MessageFlags.Ephemeral, name);
    }
});

test('simultaneous /play calls are added one after another (no duplicate queues)', async () => {
    const { manager } = setup();
    let queue = null;
    let active = 0;
    let maxActive = 0;
    manager.getQueue = () => queue;
    manager.distube.voices.join = async () => undefined;
    manager.distube.handler.resolve = async (query) => makeSong(Number(query));
    manager.distube.play = async (vc, song) => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise((r) => setTimeout(r, 20));
        queue ??= fakeQueue([]);
        queue.songs.push(song);
        active--;
    };
    const voiceChannel = { guild: { id: ids.guild } };
    const results = await Promise.all(['1', '2', '3'].map((query) => manager.play({ voiceChannel, member: fakeMember(), query })));
    assert.equal(maxActive, 1);
    assert.deepEqual(results.map((r) => r.started), [true, false, false]);
    assert.deepEqual(results.map((r) => r.position), [0, 1, 2]);
});
