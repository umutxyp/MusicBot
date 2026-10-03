'use strict';

const { makeSong } = require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const { DisTubeError, RepeatMode } = require('distube');
const actions = require('../src/music/actions');
const i18n = require('../src/core/i18n');

const t = (key, vars) => i18n.t('en', key, vars);

function fakeQueue(count = 5) {
    const queue = {
        id: '111111111111111111',
        songs: Array.from({ length: count }, (_, i) => makeSong(i)),
        previousSongs: [],
        paused: false,
        autoplay: false,
        repeatMode: 0,
        volume: 80,
        calls: [],
        filterNames: [],
        filters: {
            get names() { return queue.filterNames; },
            get size() { return queue.filterNames.length; },
            set: (names) => { queue.filterNames = names; queue.calls.push('filters.set'); },
            clear: () => { queue.filterNames = []; queue.calls.push('filters.clear'); },
        },
        async pause() { queue.paused = true; },
        async resume() { queue.paused = false; },
        async skip() { queue.calls.push('skip'); },
        async previous() { queue.calls.push('previous'); },
        async shuffle() { queue.calls.push('shuffle'); },
        async seek(time) { queue.calls.push(`seek:${time}`); },
        async jump(pos) { queue.calls.push(`jump:${pos}`); return queue.songs[pos]; },
        async stop() { queue.calls.push('stop'); },
        setVolume(v) { queue.volume = v; },
        toggleAutoplay() { queue.autoplay = !queue.autoplay; return queue.autoplay; },
    };
    return queue;
}

test('pause / resume / toggle', async () => {
    const q = fakeQueue();
    assert.equal((await actions.resume(q, t)).ok, false);
    assert.equal((await actions.pause(q, t)).ok, true);
    assert.equal((await actions.pause(q, t)).ok, false);
    await actions.togglePause(q, t);
    assert.equal(q.paused, false);
});

test('skip and previous only act when possible', async () => {
    const lone = fakeQueue(1);
    assert.equal((await actions.skip(lone, t)).ok, false);
    lone.autoplay = true;
    assert.equal((await actions.skip(lone, t)).ok, true);
    const q = fakeQueue();
    assert.equal((await actions.previous(q, t)).ok, false);
    q.previousSongs.push(makeSong(9));
    assert.equal((await actions.previous(q, t)).ok, true);
});

test('loop cycles Off -> Song -> Queue -> Off and accepts explicit modes', () => {
    const q = fakeQueue();
    actions.setLoop(q, t);
    assert.equal(q.repeatMode, RepeatMode.SONG);
    actions.setLoop(q, t);
    assert.equal(q.repeatMode, RepeatMode.QUEUE);
    actions.setLoop(q, t);
    assert.equal(q.repeatMode, RepeatMode.DISABLED);
    assert.match(actions.setLoop(q, t, RepeatMode.QUEUE).message, /queue repeat/);
});

test('volume validation', () => {
    const q = fakeQueue();
    assert.equal(actions.setVolume(q, t, 150).ok, false);
    assert.equal(actions.setVolume(q, t, -1).ok, false);
    assert.equal(actions.setVolume(q, t, 1.5).ok, false);
    assert.equal(actions.setVolume(q, t, NaN).ok, false);
    assert.equal(actions.setVolume(q, t, 0).ok, true);
    assert.equal(actions.setVolume(q, t, 100).ok, true);
    assert.equal(q.volume, 100);
});

test('filters: set one, ignore re-applying the same one, clear', () => {
    const q = fakeQueue();
    assert.equal(actions.setFilter(q, t, 'nightcore').ok, true);
    actions.setFilter(q, t, 'nightcore');
    assert.deepEqual(q.calls, ['filters.set']);
    assert.equal(actions.setFilter(q, t, 'evil').ok, false);
    actions.setFilter(q, t, 'none');
    assert.deepEqual(q.filterNames, []);
    actions.setFilter(q, t, 'none');
    assert.deepEqual(q.calls, ['filters.set', 'filters.clear']);
});

test('seek validates time and live streams', async () => {
    const q = fakeQueue();
    assert.equal((await actions.seek(q, t, null)).ok, false);
    assert.equal((await actions.seek(q, t, 10_000)).ok, false);
    assert.equal((await actions.seek(q, t, 30)).ok, true);
    q.songs[0] = makeSong(1, { isLive: true });
    assert.equal((await actions.seek(q, t, 30)).ok, false);
});

test('remove / move / jump / clear keep the current song in place', async () => {
    const q = fakeQueue(5);
    const current = q.songs[0];
    assert.equal(actions.remove(q, t, 0).ok, false);
    assert.equal(actions.remove(q, t, 5).ok, false);
    assert.equal(actions.remove(q, t, 2).ok, true);
    assert.equal(q.songs.length, 4);
    const moving = q.songs[3];
    assert.equal(actions.move(q, t, 3, 1).ok, true);
    assert.equal(q.songs[1], moving);
    assert.equal(actions.move(q, t, 0, 1).ok, false);
    assert.equal((await actions.jump(q, t, 9)).ok, false);
    assert.equal((await actions.jump(q, t, 2)).ok, true);
    assert.equal(actions.clear(q, t).ok, true);
    assert.deepEqual(q.songs, [current]);
    assert.equal(actions.clear(q, t).ok, false);
});

test('shuffle needs at least two upcoming songs', async () => {
    assert.equal((await actions.shuffle(fakeQueue(2), t)).ok, false);
    assert.equal((await actions.shuffle(fakeQueue(3), t)).ok, true);
});

test('safely() turns DisTube state errors into messages and rethrows others', async () => {
    const outcome = await actions.safely(async () => { throw new DisTubeError('NO_PREVIOUS'); }, t);
    assert.equal(outcome.ok, false);
    await assert.rejects(actions.safely(async () => { throw new Error('boom'); }, t), /boom/);
});
