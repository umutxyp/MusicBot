'use strict';

const { fakeMember } = require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const { Playlist, Song } = require('distube');
const { YouTubePlugin, GenericPlugin, parseYouTubeUrl, youtubeInfo, streamTtl } = require('../src/music/plugins');

const VIDEO = 'dQw4w9WgXcQ';
const streamUrl = (id) => `https://rr1.googlevideo.com/videoplayback?id=${id}&expire=${Math.floor(Date.now() / 1000) + 6 * 3600}`;

function fakeRunner(handler) {
    const calls = [];
    const runner = async (target, args, options) => {
        calls.push({ target, args, options });
        return handler(target, args, options);
    };
    runner.calls = calls;
    return runner;
}

const fullInfo = (id = VIDEO, extra = {}) => ({
    id, title: `Title ${id}`, duration: 213, uploader: 'Rick Astley', uploader_url: 'https://youtube.com/@rick',
    view_count: 10, age_limit: 0, url: streamUrl(id), ...extra,
});

test('parseYouTubeUrl handles every common URL shape', () => {
    const cases = [
        [`https://www.youtube.com/watch?v=${VIDEO}`, { type: 'video', id: VIDEO }],
        [`https://youtu.be/${VIDEO}?si=abc`, { type: 'video', id: VIDEO }],
        [`https://m.youtube.com/watch?v=${VIDEO}&t=10`, { type: 'video', id: VIDEO }],
        [`https://music.youtube.com/watch?v=${VIDEO}`, { type: 'video', id: VIDEO }],
        [`https://www.youtube.com/shorts/${VIDEO}`, { type: 'video', id: VIDEO }],
        [`https://www.youtube.com/live/${VIDEO}`, { type: 'video', id: VIDEO }],
        ['https://www.youtube.com/playlist?list=PL1234567890', { type: 'playlist', id: 'PL1234567890' }],
        [`https://www.youtube.com/watch?v=${VIDEO}&list=PL1234567890`, { type: 'playlist', id: 'PL1234567890' }],
        [`https://www.youtube.com/watch?v=${VIDEO}&list=RD${VIDEO}`, { type: 'video', id: VIDEO }],
        ['https://www.youtube.com/channel/abc', null],
        ['https://soundcloud.com/a/b', null],
        ['not a url', null],
        ['https://www.youtube.com/watch?v=short', null],
    ];
    for (const [url, expected] of cases) assert.deepEqual(parseYouTubeUrl(url), expected, url);
});

test('youtubeInfo builds stable URLs and thumbnails, handles live and age limits', () => {
    const info = youtubeInfo({ id: VIDEO, title: 'T', duration: 100, channel: 'C', age_limit: 18 });
    assert.equal(info.url, `https://www.youtube.com/watch?v=${VIDEO}`);
    assert.equal(info.thumbnail, `https://i.ytimg.com/vi/${VIDEO}/hqdefault.jpg`);
    assert.equal(info.uploader.name, 'C');
    assert.equal(info.ageRestricted, true);
    const live = youtubeInfo({ id: VIDEO, title: 'L', duration: 999, live_status: 'is_live' });
    assert.equal(live.isLive, true);
    assert.equal(live.duration, 0);
});

test('streamTtl follows the googlevideo expiry with a safety margin', () => {
    const ttl = streamTtl(streamUrl('x'));
    assert.ok(ttl > 3600_000 && ttl <= 4 * 3600_000);
    assert.equal(streamTtl('https://example.com/a.mp3'), 3600_000);
    assert.equal(streamTtl(`https://x/?expire=${Math.floor(Date.now() / 1000)}`), 60_000);
});

test('resolving a video needs a single yt-dlp call for metadata and stream', async () => {
    const runner = fakeRunner(() => fullInfo());
    const plugin = new YouTubePlugin({ runner });
    const member = fakeMember();
    const song = await plugin.resolve(`https://youtu.be/${VIDEO}`, { member, metadata: { requesterId: member.id } });
    assert.ok(song instanceof Song);
    assert.equal(song.name, `Title ${VIDEO}`);
    assert.equal(song.duration, 213);
    assert.equal(song.metadata.requesterId, member.id);
    assert.equal(await plugin.getStreamURL(song), streamUrl(VIDEO).split('&expire')[0] + streamUrl(VIDEO).slice(streamUrl(VIDEO).indexOf('&expire')));
    assert.equal(runner.calls.length, 1, 'stream URL must come from the cache');
    assert.ok(runner.calls[0].args.includes('--no-playlist'));
});

test('playlists are resolved flat and skip private/deleted entries', async () => {
    const runner = fakeRunner(() => ({
        id: 'PL1', title: 'My list', entries: [
            { id: 'aaaaaaaaaaa', title: 'A', duration: 100 },
            { id: 'bbbbbbbbbbb', title: '[Private video]' },
            { id: 'ccccccccccc', title: 'C', duration: 50 },
            null,
        ],
    }));
    const plugin = new YouTubePlugin({ runner });
    const playlist = await plugin.resolve('https://www.youtube.com/playlist?list=PL1', {});
    assert.ok(playlist instanceof Playlist);
    assert.equal(playlist.name, 'My list');
    assert.deepEqual(playlist.songs.map((s) => s.id), ['aaaaaaaaaaa', 'ccccccccccc']);
    assert.ok(runner.calls[0].args.includes('--flat-playlist'));
    await assert.rejects(new YouTubePlugin({ runner: fakeRunner(() => ({ entries: [] })) }).resolve('https://www.youtube.com/playlist?list=PL2', {}));
});

test('searchSong caches results and the stream URL; concurrent calls share one process', async () => {
    const runner = fakeRunner(async () => {
        await new Promise((r) => setTimeout(r, 20));
        return { entries: [fullInfo()] };
    });
    const plugin = new YouTubePlugin({ runner });
    const [a, b] = await Promise.all([plugin.searchSong('never gonna', {}), plugin.searchSong('Never Gonna', {})]);
    assert.equal(a.id, VIDEO);
    assert.equal(b.id, VIDEO);
    assert.notEqual(a, b, 'each call gets its own Song object');
    await plugin.getStreamURL(a);
    assert.equal(runner.calls.length, 1);
    assert.equal(runner.calls[0].target, 'ytsearch1:never gonna');
});

test('searchSong reports YouTube failures instead of silently switching source', async () => {
    const plugin = new YouTubePlugin({ runner: fakeRunner(() => { throw new Error('Sign in to confirm'); }) });
    await assert.rejects(plugin.searchSong('x', {}), /Sign in/);
    assert.match(plugin.lastSearchError.message, /Sign in/);
    assert.ok(plugin.lastSearchErrorAt > 0);
    const empty = new YouTubePlugin({ runner: fakeRunner(() => ({ entries: [] })) });
    assert.equal(await empty.searchSong('nothing', {}), null, 'no results at all may still try the next source');
});

test('getStreamURL fetches once per song and per proxy key, with low priority for prefetch', async () => {
    const runner = fakeRunner((target) => ({ url: streamUrl(target.slice(-11)) }));
    const plugin = new YouTubePlugin({ runner });
    const song = new Song({ plugin, source: 'youtube', playFromSource: true, id: VIDEO, name: 'x', url: `https://www.youtube.com/watch?v=${VIDEO}` });
    await plugin.prefetch(song);
    assert.equal(runner.calls[0].options.priority, 'low');
    await Promise.all([plugin.getStreamURL(song), plugin.getStreamURL(song)]);
    assert.equal(runner.calls.length, 1);
    const broken = new YouTubePlugin({ runner: fakeRunner(() => ({})) });
    await assert.rejects(broken.getStreamURL(song), /NO_STREAM_URL|x/);
});

test('related songs exclude the current song, shorts and very long videos', async () => {
    const runner = fakeRunner(() => ({
        entries: [
            { id: VIDEO, title: 'self', duration: 200 },
            { id: 'aaaaaaaaaaa', title: 'ok', duration: 200 },
            { id: 'bbbbbbbbbbb', title: 'short', duration: 30 },
            { id: 'ccccccccccc', title: 'mix', duration: 3600 },
            { id: 'ddddddddddd', title: 'unknown length' },
        ],
    }));
    const plugin = new YouTubePlugin({ runner });
    const current = new Song({ plugin, source: 'youtube', playFromSource: true, id: VIDEO, name: 'x', url: 'u' });
    const related = await plugin.getRelatedSongs(current);
    assert.deepEqual(related.map((s) => s.id), ['aaaaaaaaaaa', 'ddddddddddd']);
    assert.equal(runner.calls[0].target, `https://www.youtube.com/watch?v=${VIDEO}&list=RD${VIDEO}`);
    assert.deepEqual(await plugin.getRelatedSongs({ id: 'sc-123' }), []);
});

test('search() returns metadata for the /search menu', async () => {
    const plugin = new YouTubePlugin({ runner: fakeRunner(() => ({ entries: [{ id: 'aaaaaaaaaaa', title: 'A', duration: 10 }, { id: 'bad' }] })) });
    const results = await plugin.search('query', 5);
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'A');
});

test('GenericPlugin handles single media and playlists from other sites', async () => {
    const single = new GenericPlugin({ runner: fakeRunner(() => ({ id: 1, title: 'Track', extractor_key: 'Bandcamp', duration: 60, url: 'https://cdn/x.mp3', webpage_url: 'https://band.bandcamp.com/track/x' })) });
    assert.equal(single.validate('https://example.com/x'), true);
    assert.equal(single.validate('file:///etc/passwd'), false);
    const song = await single.resolve('https://band.bandcamp.com/track/x', {});
    assert.equal(song.source, 'bandcamp');
    assert.equal(await single.getStreamURL(song), 'https://cdn/x.mp3');

    const list = new GenericPlugin({ runner: fakeRunner(() => ({ id: 'al', title: 'Album', entries: [{ id: 1, title: 'a', url: 'https://x/1' }, { id: 2, title: 'b', url: 'https://x/2' }] })) });
    const playlist = await list.resolve('https://x/album', {});
    assert.equal(playlist.songs.length, 2);
});
