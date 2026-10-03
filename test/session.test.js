'use strict';

const { makeSong, fakeMember, ids } = require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Song } = require('distube');
const { SessionStore, MAX_AGE_MS } = require('../src/music/session');

const plugins = { youtube: { type: 'extractor', name: 'yt' }, spotify: { type: 'info-extractor', name: 'sp' } };

function fakeQueue(songs) {
    return {
        id: ids.guild,
        songs,
        voiceChannel: { id: ids.voice },
        textChannel: { id: ids.text },
        currentTime: 61.7,
        volume: 55,
        repeatMode: 2,
        autoplay: true,
        paused: false,
        filters: { names: ['bassboost'] },
    };
}

test('queues round-trip through the session store without network calls', async () => {
    const store = new SessionStore(plugins, path.join(process.env.DATA_DIR, 'sessions-a'));
    const yt = makeSong(1, { plugin: plugins.youtube });
    yt.member = fakeMember();
    const spotify = makeSong(2, { plugin: plugins.spotify, source: 'spotify', playFromSource: false });
    const auto = makeSong(3, { plugin: plugins.youtube });
    auto.member = fakeMember(ids.bot, true);
    const unknown = makeSong(4, { plugin: { type: 'x' } });
    await store.save(fakeQueue([yt, spotify, auto, unknown]));

    const data = store.load(ids.guild);
    assert.equal(data.songs.length, 3, 'songs from unknown plugins are dropped');
    assert.equal(data.position, 61);
    assert.deepEqual(data.filters, ['bassboost']);

    const requester = fakeMember();
    const me = fakeMember(ids.bot, true);
    const guild = { id: ids.guild, members: { me, cache: new Map([[ids.user, requester]]) } };
    const songs = store.buildSongs(data, guild);
    assert.ok(songs.every((s) => s instanceof Song));
    assert.equal(songs[0].plugin, plugins.youtube);
    assert.equal(songs[0].stream.playFromSource, true);
    assert.equal(songs[1].plugin, plugins.spotify);
    assert.equal(songs[1].stream.playFromSource, false);
    assert.equal(songs[0].member, requester);
    assert.equal(songs[2].member, me);
    assert.equal(songs[0].metadata.requesterId, ids.user);
    assert.equal(songs[1].uploader.name, 'Artist 2');
    assert.ok(songs.every((s) => s.metadata.guildId === ids.guild), 'guild id survives a restart even without a cached member');
});

test('old or empty sessions are ignored and removable', async () => {
    const store = new SessionStore(plugins, path.join(process.env.DATA_DIR, 'sessions-b'));
    await store.save(fakeQueue([makeSong(1, { plugin: plugins.youtube })]));
    store.store.cache.get(ids.guild).savedAt = Date.now() - MAX_AGE_MS - 1;
    assert.equal(store.load(ids.guild), null);
    await store.save(fakeQueue([]));
    assert.equal(store.load(ids.guild), null);
    assert.deepEqual(store.guildIds(), []);
});
