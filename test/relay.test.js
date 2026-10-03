'use strict';

const path = require('node:path');
require('./helpers');
process.env.YTDLP_PATH = path.join(__dirname, 'fixtures', 'fake-ytdlp.js');

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { StreamRelay } = require('../src/music/relay');

const skip = process.platform === 'win32' ? 'uses a POSIX shebang script as the fake yt-dlp' : false;

function fetchBytes(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let size = 0;
            res.on('data', (chunk) => (size += chunk.length));
            res.on('end', () => resolve({ status: res.statusCode, size }));
        }).on('error', reject);
    });
}

function spyRelay() {
    const calls = [];
    const { spawn } = require('node:child_process');
    const relay = new StreamRelay({
        dir: path.join(process.env.DATA_DIR, `relay-${Math.random()}`),
        spawnImpl: (bin, args, opts) => {
            calls.push(args);
            return spawn(bin, args, opts);
        },
    });
    return { relay, calls };
}

test('the relay downloads the already chosen format with yt-dlp and serves it to ffmpeg', { skip }, async () => {
    const { relay, calls } = spyRelay();
    try {
        const url = await relay.register({ info: { id: 'x', format_id: '251', url: 'https://googlevideo/ok' }, proxy: 'socks5://p:1' });
        assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/[0-9a-f]{24}$/);
        assert.equal(await relay.warm(url), url);
        const first = await fetchBytes(url);
        assert.deepEqual(first, { status: 200, size: 50_000 });
        assert.equal(calls.length, 1, 'the warmed download is reused');
        const args = calls[0];
        assert.equal(args[args.indexOf('-f') + 1], '251');
        assert.ok(args.includes('--load-info-json'));
        assert.equal(args[args.indexOf('--proxy') + 1], 'socks5://p:1', 'any proxy type works because yt-dlp downloads');
        assert.deepEqual(args.slice(args.indexOf('-o'), args.indexOf('-o') + 2), ['-o', '-']);

        const again = await fetchBytes(url);
        assert.equal(again.size, 50_000, 'loop: the same song can be streamed again');
        assert.equal(calls.length, 2);
        assert.equal(relay.errorFor(url), null);
    } finally {
        relay.close();
    }
});

test('a refused source fails during warm() with yt-dlp\'s reason, before playback starts', { skip }, async () => {
    const { relay } = spyRelay();
    try {
        const url = await relay.register({ info: { id: 'x', format_id: '251', url: 'https://googlevideo/fail' } });
        await assert.rejects(relay.warm(url), /HTTP Error 403: Forbidden/);
        assert.match(relay.errorFor(url).message, /403/);
        assert.equal(relay.errorFor('http://example.com/x'), null);
    } finally {
        relay.close();
    }
});

test('warm() gives up when no audio arrives, and an unused warmed download is stopped', { skip }, async () => {
    const { relay } = spyRelay();
    try {
        const slow = await relay.register({ url: 'https://cdn/slow.mp3' });
        await assert.rejects(relay.warm(slow, { timeoutMs: 300 }), /No audio received/);

        const unused = await relay.register({ url: 'https://cdn/ok.mp3' });
        await relay.warm(unused, { holdMs: 100 });
        await new Promise((r) => setTimeout(r, 300));
        const entry = [...relay.entries.values()].find((e) => e.url === 'https://cdn/ok.mp3');
        assert.equal(entry.pending, null, 'the held download was dropped');
        assert.equal((await fetchBytes(unused)).size, 50_000, 'and a new one starts when ffmpeg connects later');
    } finally {
        relay.close();
    }
});

test('unknown relay ids return 404', { skip }, async () => {
    const { relay } = spyRelay();
    try {
        await relay.start();
        assert.equal((await fetchBytes(`http://127.0.0.1:${relay.port}/nope`)).status, 404);
        await assert.rejects(relay.warm(`http://127.0.0.1:${relay.port}/nope`), /Unknown relay stream/);
    } finally {
        relay.close();
    }
});

test('stream info is trimmed to the chosen format before it is written', () => {
    const { trimInfo } = require('../src/music/relay');
    const info = {
        id: 'x', format_id: '251', url: 'u',
        formats: [{ format_id: '140' }, { format_id: '251', url: 'u', http_headers: { a: 1 } }],
        automatic_captions: { en: [] }, subtitles: {}, thumbnails: [], description: 'long',
    };
    const trimmed = trimInfo(info);
    assert.deepEqual(trimmed.formats, [{ format_id: '251', url: 'u', http_headers: { a: 1 } }]);
    for (const key of ['automatic_captions', 'subtitles', 'thumbnails', 'description']) assert.equal(key in trimmed, false);
    assert.equal(info.formats.length, 2, 'the cached info is not modified');
});

test('each process uses its own relay folder; old streams are evicted beyond the limit', { skip }, async () => {
    const { relay } = spyRelay();
    try {
        assert.ok(new StreamRelay().dir.endsWith(String(process.pid)));
        for (let i = 0; i < 305; i++) await relay.register({ url: `https://cdn/${i}.mp3` });
        assert.equal(relay.entries.size, 300);
        assert.equal([...relay.entries.values()][0].url, 'https://cdn/5.mp3');
    } finally {
        relay.close();
    }
});
