'use strict';

/**
 * End-to-end audio pipeline with the real yt-dlp and ffmpeg binaries:
 * local HTTP audio file -> yt-dlp (our exact arguments) -> DisTube stream -> ffmpeg PCM output.
 * Runs when YTDLP_E2E points to a real yt-dlp binary, e.g.
 *   YTDLP_E2E=$(which yt-dlp) npm test
 */
require('./helpers');
const real = process.env.YTDLP_E2E;
if (real) process.env.YTDLP_PATH = real;

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const skip = real ? false : 'set YTDLP_E2E to a real yt-dlp binary to run';

test('real yt-dlp + ffmpeg produce playable Opus audio through the DisTube stream', { skip, timeout: 60_000 }, async () => {
    const { DisTubeStream } = require('distube');
    const { GenericPlugin } = require('../src/music/plugins');
    const { resolveFfmpeg } = require('../src/music/manager');
    const ffmpeg = resolveFfmpeg();

    const file = path.join(process.env.DATA_DIR, 'tone.mp3');
    execFileSync(ffmpeg, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3', '-y', file]);
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': fs.statSync(file).size });
        fs.createReadStream(file).pipe(res);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${server.address().port}/tone.mp3`;
    process.env.no_proxy = process.env.NO_PROXY = '127.0.0.1,localhost';

    try {
        const plugin = new GenericPlugin();
        const song = await plugin.resolve(url, { metadata: { guildId: '111111111111111111' } });
        assert.equal(song.name, 'tone');
        const streamUrl = await plugin.getStreamURL(song);
        assert.match(streamUrl, /^http:\/\/127\.0\.0\.1/);

        const stream = new DisTubeStream(streamUrl, { ffmpeg: { path: ffmpeg, args: { global: {}, input: {}, output: {} } }, seek: 1 });
        // Drain the Opus packets exactly like Discord's AudioPlayer would.
        let packets = 0;
        const done = new Promise((resolve, reject) => {
            const opus = stream.audioResource.playStream;
            opus.on('data', () => { packets++; });
            opus.on('end', resolve);
            stream.on('error', reject);
        });
        stream.spawn();
        await done;
        // 2 seconds (3s file, seek 1s) of audio in 20 ms Opus frames ≈ 100 packets
        assert.ok(packets >= 90 && packets <= 110, `unexpected Opus packet count ${packets}`);
    } finally {
        server.close();
    }
});
