'use strict';

const path = require('node:path');
const fs = require('node:fs');
require('./helpers');
process.env.BIN_DIR = path.join(process.env.DATA_DIR, 'bin');
delete process.env.YTDLP_PATH;

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const skip = process.platform === 'win32' ? 'uses a POSIX shebang script as the fake binary' : false;

test('the self-contained yt-dlp build (no Python needed) is chosen for each platform', () => {
    const { ytDlpAsset } = require('../src/core/binaries');
    assert.equal(ytDlpAsset('darwin', 'arm64'), 'yt-dlp_macos');
    assert.equal(ytDlpAsset('darwin', 'x64'), 'yt-dlp_macos');
    assert.equal(ytDlpAsset('linux', 'x64', false), 'yt-dlp_linux');
    assert.equal(ytDlpAsset('linux', 'arm64', false), 'yt-dlp_linux_aarch64');
    assert.equal(ytDlpAsset('linux', 'x64', true), 'yt-dlp_musllinux');
    assert.equal(ytDlpAsset('linux', 'arm64', true), 'yt-dlp_musllinux_aarch64');
    assert.equal(ytDlpAsset('win32', 'x64'), 'yt-dlp.exe');
    assert.equal(ytDlpAsset('win32', 'ia32'), 'yt-dlp_x86.exe');
    assert.equal(ytDlpAsset('win32', 'arm64'), 'yt-dlp_arm64.exe');
    assert.equal(ytDlpAsset('linux', 'arm', false), null);
});

test('ensureYtDlp downloads yt-dlp when missing, replaces a broken one and keeps a working one', { skip }, async () => {
    // A fake yt-dlp padded past the 1 MB sanity check.
    const fake = fs.readFileSync(path.join(__dirname, 'fixtures', 'fake-ytdlp.js'), 'utf8') + `\n//${'x'.repeat(1024 * 1024)}\n`;
    let requests = 0;
    const server = http.createServer((req, res) => {
        requests++;
        if (req.url.endsWith('/missing')) return res.writeHead(404).end();
        res.writeHead(200, { 'Content-Type': 'application/octet-stream' }).end(fake);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    process.env.YTDLP_DOWNLOAD_BASE = `http://127.0.0.1:${server.address().port}`;
    process.env.no_proxy = process.env.NO_PROXY = '127.0.0.1,localhost';
    delete require.cache[require.resolve('../src/core/binaries')];
    const binaries = require('../src/core/binaries');
    const local = binaries.localYtDlpPath();

    try {
        assert.equal(fs.existsSync(local), false);
        assert.equal(await binaries.ensureYtDlp(), local);
        assert.equal(requests, 1);
        assert.equal((await binaries.probe(local)).output, '2026.09.01');

        assert.equal(await binaries.ensureYtDlp(), local);
        assert.equal(requests, 1, 'a working binary is not downloaded again');

        // Simulates the "unsupported version of Python" failure: the binary exists but cannot run.
        fs.writeFileSync(local, '#!/bin/sh\necho "ImportError: unsupported version of Python" >&2\nexit 1\n', { mode: 0o755 });
        assert.equal(await binaries.ensureYtDlp(), local);
        assert.equal(requests, 2, 'a broken binary is replaced');
        assert.ok((await binaries.probe(local)).ok);
        assert.ok(fs.existsSync(path.join(process.env.DATA_DIR, 'yt-dlp.updated')));
    } finally {
        server.close();
    }
});

test('probe reports why a binary does not run', { skip }, async () => {
    const { probe } = require('../src/core/binaries');
    assert.deepEqual(await probe(path.join(process.env.DATA_DIR, 'nope')), { ok: false, error: 'not found' });
    const broken = path.join(process.env.DATA_DIR, 'broken.sh');
    fs.writeFileSync(broken, '#!/bin/sh\necho "ImportError: unsupported version of Python" >&2\nexit 1\n', { mode: 0o755 });
    const result = await probe(broken);
    assert.equal(result.ok, false);
    assert.match(result.error, /unsupported version of Python/);
});

test('ensureFfmpeg finds a working ffmpeg', async () => {
    const { ensureFfmpeg, probe } = require('../src/core/binaries');
    const found = await ensureFfmpeg();
    assert.ok(found, 'ffmpeg must be available for the bot');
    assert.ok((await probe(found, ['-version'])).ok);
});
