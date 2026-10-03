'use strict';

require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const { DisTubeError } = require('distube');
const { errorKey } = require('../src/music/errors');
const { cleanTitle, pickBest } = require('../src/music/lyrics');
const suggest = require('../src/music/suggest');

test('errors map to helpful translation keys', () => {
    const cases = [
        [new DisTubeError('VOICE_FULL'), 'ui.voice_full'],
        [new DisTubeError('NO_RESULT', 'x'), 'musicplayer.no_results_found'],
        [new DisTubeError('NON_NSFW'), 'errors.youtube_age_restricted'],
        [new DisTubeError('NOT_SUPPORTED_URL'), 'ui.unsupported'],
        [Object.assign(new Error('x'), { stderr: 'ERROR: Sign in to confirm you’re not a bot' }), 'errors.youtube_bot_detection'],
        [new Error('Video unavailable'), 'errors.youtube_unavailable'],
        [new Error('HTTP Error 429: Too Many Requests'), 'errors.rate_limited'],
        [new Error('The uploader has not made this video available in your country'), 'errors.youtube_geo_blocked'],
        [new Error('connect ETIMEDOUT'), 'errors.network_error'],
        [new DisTubeError('FFMPEG_EXITED', 1), 'errors.stream_failed'],
        [new Error('???'), 'errors.unknown'],
        [undefined, 'errors.unknown'],
    ];
    for (const [error, key] of cases) assert.equal(errorKey(error), key, String(error?.message));
});

test('lyrics: video titles are cleaned before searching', () => {
    assert.deepEqual(cleanTitle('Rick Astley - Never Gonna Give You Up (Official Music Video)', 'RickAstleyVEVO'), { title: 'Never Gonna Give You Up', artist: 'Rick Astley' });
    assert.deepEqual(cleanTitle('Song [Lyrics] ft. Someone', 'Band - Topic'), { title: 'Song', artist: 'Band' });
    assert.equal(cleanTitle('(Official Video)', '').title, '(Official Video)');
});

test('lyrics: the result closest in duration wins and instrumentals are ignored', () => {
    const results = [
        { plainLyrics: 'a', duration: 300 },
        { plainLyrics: 'b', duration: 212 },
        { plainLyrics: null, duration: 213 },
        { plainLyrics: 'c', duration: 213, instrumental: true },
    ];
    assert.equal(pickBest(results, 213).plainLyrics, 'b');
    assert.equal(pickBest(results, 0).plainLyrics, 'a');
    assert.equal(pickBest([], 1), null);
});

test('autocomplete: links and long text get no choices, suggestions are deduplicated', async (t) => {
    assert.deepEqual(await suggest.choices('https://youtu.be/x'), []);
    assert.deepEqual(await suggest.choices('x'.repeat(101)), []);
    assert.deepEqual(await suggest.choices(''), []);
    t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(['tarkan', ['tarkan', 'Tarkan şımarık', 'tarkan kuzu kuzu', 'y'.repeat(120)]])));
    const choices = await suggest.choices('tarkan');
    assert.deepEqual(choices.map((c) => c.value), ['tarkan', 'Tarkan şımarık', 'tarkan kuzu kuzu']);
    t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline'); });
    assert.deepEqual((await suggest.choices('offline query')).map((c) => c.value), ['offline query']);
});
