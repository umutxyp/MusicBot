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

/**
 * Minimal ZIP writer (stored entries) to build archives shaped like yt-dlp's onedir releases.
 */
function createZip(entries) {
    const zlib = require('node:zlib');
    const locals = [];
    const centrals = [];
    let offset = 0;
    for (const { name, data = Buffer.alloc(0), mode = 0o644, dir = false } of entries) {
        const nameBuf = Buffer.from(name);
        const crc = dir ? 0 : zlib.crc32(data);
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt32LE(crc, 14);
        local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nameBuf.length, 26);
        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE((3 << 8) | 20, 4); central.writeUInt16LE(20, 6);
        central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24);
        central.writeUInt16LE(nameBuf.length, 28);
        central.writeUInt32LE((((dir ? 0o040000 : 0o100000) | mode) << 16) >>> 0, 38);
        central.writeUInt32LE(offset, 42);
        locals.push(local, nameBuf, data);
        centrals.push(central, nameBuf);
        offset += 30 + nameBuf.length + data.length;
    }
    const centralBuf = Buffer.concat(centrals);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(centralBuf.length, 12); end.writeUInt32LE(offset, 16);
    return Buffer.concat([...locals, centralBuf, end]);
}

test('the onedir yt-dlp build (no Python, no unpacking on every run) is chosen for each platform', () => {
    const { ytDlpAsset } = require('../src/core/binaries');
    assert.equal(ytDlpAsset('darwin', 'arm64'), 'yt-dlp_macos.zip');
    assert.equal(ytDlpAsset('darwin', 'x64'), 'yt-dlp_macos.zip');
    assert.equal(ytDlpAsset('linux', 'x64', false), 'yt-dlp_linux.zip');
    assert.equal(ytDlpAsset('linux', 'arm64', false), 'yt-dlp_linux_aarch64.zip');
    assert.equal(ytDlpAsset('linux', 'arm', false), 'yt-dlp_linux_armv7l.zip');
    assert.equal(ytDlpAsset('linux', 'x64', true), 'yt-dlp_musllinux.zip');
    assert.equal(ytDlpAsset('linux', 'arm64', true), 'yt-dlp_musllinux_aarch64.zip');
    assert.equal(ytDlpAsset('win32', 'x64'), 'yt-dlp_win.zip');
    assert.equal(ytDlpAsset('win32', 'ia32'), 'yt-dlp_win_x86.zip');
    assert.equal(ytDlpAsset('win32', 'arm64'), 'yt-dlp_win_arm64.zip');
    assert.equal(ytDlpAsset('freebsd', 'x64'), null);
});

test('extractZip unpacks folders, permissions and rejects unsafe paths', () => {
    const { extractZip } = require('../src/core/unzip');
    const dir = path.join(process.env.DATA_DIR, 'unzip');
    const zip = createZip([
        { name: '_internal/', dir: true, mode: 0o755 },
        { name: '_internal/lib.txt', data: Buffer.from('lib') },
        { name: 'tool', data: Buffer.from('#!/bin/sh\necho hi\n'), mode: 0o755 },
    ]);
    assert.equal(extractZip(zip, dir), 3);
    assert.equal(fs.readFileSync(path.join(dir, '_internal', 'lib.txt'), 'utf8'), 'lib');
    if (process.platform !== 'win32') assert.equal(fs.statSync(path.join(dir, 'tool')).mode & 0o777, 0o755);
    assert.throws(() => extractZip(createZip([{ name: '../evil', data: Buffer.from('x') }]), dir), /Unsafe path/);
    assert.throws(() => extractZip(Buffer.from('not a zip'), dir), /Not a ZIP/);
});

test('ensureYtDlp installs the onedir build, replaces a broken one, keeps a working one; updates daily', { skip }, async () => {
    const fakeProgram = fs.readFileSync(path.join(__dirname, 'fixtures', 'fake-ytdlp.js'));
    const programName = process.platform === 'darwin' ? 'yt-dlp_macos' : 'yt-dlp_linux';
    // Shaped like the real archives: the program next to an _internal folder, padded past the size check.
    const archive = createZip([
        { name: '_internal/', dir: true, mode: 0o755 },
        { name: '_internal/padding.bin', data: Buffer.alloc(1024 * 1024 + 10) },
        { name: programName, data: fakeProgram, mode: 0o755 },
    ]);
    let downloads = 0;
    const server = http.createServer((req, res) => {
        downloads++;
        res.writeHead(200, { 'Content-Type': 'application/zip' }).end(archive);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    process.env.YTDLP_DOWNLOAD_BASE = `http://127.0.0.1:${server.address().port}`;
    delete require.cache[require.resolve('../src/core/binaries')];
    const binaries = require('../src/core/binaries');
    const local = binaries.localYtDlpPath();

    try {
        // A single-file build left by an earlier version of the bot.
        fs.mkdirSync(binaries.BIN_DIR, { recursive: true });
        fs.writeFileSync(path.join(binaries.BIN_DIR, 'yt-dlp'), 'old single file');

        assert.equal(fs.existsSync(local), false);
        assert.equal(await binaries.ensureYtDlp(), local);
        assert.equal(downloads, 1);
        assert.equal((await binaries.probe(local)).output, '2026.09.01');
        assert.ok(fs.existsSync(path.join(binaries.INSTALL_DIR, '_internal', 'padding.bin')));
        assert.equal(fs.existsSync(path.join(binaries.BIN_DIR, 'yt-dlp')), false, 'the old single-file build is removed');

        assert.equal(await binaries.ensureYtDlp(), local);
        assert.equal(downloads, 1, 'a working installation is not downloaded again');

        // Simulates the "unsupported version of Python" failure: the program exists but cannot run.
        fs.writeFileSync(local, '#!/bin/sh\necho "ImportError: unsupported version of Python" >&2\nexit 1\n', { mode: 0o755 });
        assert.equal(await binaries.ensureYtDlp(), local);
        assert.equal(downloads, 2, 'a broken installation is replaced');
        assert.ok((await binaries.probe(local)).ok);

        assert.equal(await binaries.updateYtDlp(), null, 'no update check within 24 hours');
        assert.equal(downloads, 2);
        const marker = path.join(process.env.DATA_DIR, 'yt-dlp.checked');
        const old = new Date(Date.now() - 25 * 3600_000);
        fs.utimesSync(marker, old, old);
        // The fake "latest release" check cannot reach GitHub here; the update must fail softly.
        const realFetch = globalThis.fetch;
        globalThis.fetch = async (url, options) => (String(url).endsWith('/releases/latest')
            ? new Response(null, { status: 302, headers: { location: 'https://github.com/yt-dlp/yt-dlp/releases/tag/2026.10.01' } })
            : realFetch(url, options));
        try {
            assert.equal(await binaries.latestYtDlpVersion(), '2026.10.01');
            assert.equal(await binaries.updateYtDlp(), '2026.09.01', 'a newer release is installed');
            assert.equal(downloads, 3);
        } finally {
            globalThis.fetch = realFetch;
        }
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
