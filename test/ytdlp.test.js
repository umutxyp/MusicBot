'use strict';

const path = require('node:path');
const fs = require('node:fs');
require('./helpers');
process.env.YTDLP_PATH = path.join(__dirname, 'fixtures', 'fake-ytdlp.js');
process.env.FAKE_YTDLP_LOG = path.join(process.env.DATA_DIR, 'ytdlp.log');

const test = require('node:test');
const assert = require('node:assert/strict');
const ytdlp = require('../src/music/ytdlp');

const skip = process.platform === 'win32' ? 'shebang scripts need a POSIX shell' : false;

test('baseArgs adds the node JS runtime, auth and proxy options', () => {
    const plain = ytdlp.baseArgs({ settings: {} });
    assert.ok(plain.includes('--js-runtimes'));
    assert.equal(plain[plain.indexOf('--js-runtimes') + 1], `node:${process.execPath}`);
    assert.ok(!plain.includes('--proxy'));

    const cookies = ytdlp.baseArgs({ proxy: 'http://p:1', settings: { cookiesFile: 'c.txt', cookiesFromBrowser: 'chrome' } });
    assert.deepEqual(cookies.slice(cookies.indexOf('--cookies'), cookies.indexOf('--cookies') + 2), ['--cookies', 'c.txt']);
    assert.ok(!cookies.includes('--cookies-from-browser'), 'cookies file wins over browser cookies');
    assert.equal(cookies[cookies.indexOf('--proxy') + 1], 'http://p:1');

    const po = ytdlp.baseArgs({ settings: { poToken: 'TOKEN', extractorArgs: 'youtube:player_client=web_safari' } });
    const extractorArgs = po.filter((_, i) => po[i - 1] === '--extractor-args');
    assert.deepEqual(extractorArgs, ['youtube:po_token=web.gvs+TOKEN;player_client=web,default', 'youtube:player_client=web_safari']);
});

test('proxyFor is sticky per guild and spreads guilds over proxies', () => {
    const proxies = ['http://a:1', 'http://b:1', 'http://c:1'];
    assert.equal(ytdlp.proxyFor('123', []), null);
    assert.equal(ytdlp.proxyFor('123', ['http://only:1']), 'http://only:1');
    assert.equal(ytdlp.proxyFor('123', proxies), ytdlp.proxyFor('123', proxies));
    const used = new Set(Array.from({ length: 50 }, (_, i) => ytdlp.proxyFor(String(100000000000000000n + BigInt(i)), proxies)));
    assert.equal(used.size, 3);
});

test('cleanError keeps only the useful part of the last ERROR line', () => {
    assert.equal(ytdlp.cleanError('WARNING: x\nERROR: [youtube] abc123: Video unavailable'), 'Video unavailable');
    assert.equal(ytdlp.cleanError('just text'), 'just text');
});

test('runJson parses stdout even when stderr has warnings', { skip }, async () => {
    const info = await ytdlp.runJson('ok-target', ['--flat-playlist']);
    assert.equal(info.target, 'ok-target');
    const logged = fs.readFileSync(process.env.FAKE_YTDLP_LOG, 'utf8').trim().split('\n').map(JSON.parse).pop();
    assert.deepEqual(logged.slice(-3), ['--dump-single-json', '--', 'ok-target']);
    assert.ok(logged.includes('--ignore-config'));
});

test('runJson rejects with a clean message on failure', { skip }, async () => {
    await assert.rejects(ytdlp.runJson('fail'), (error) => {
        assert.equal(error.name, 'YtDlpError');
        assert.match(error.message, /Sign in to confirm/);
        assert.match(error.stderr, /WARNING/);
        return true;
    });
    await assert.rejects(ytdlp.runJson('invalid'), /invalid JSON/);
});

test('runJson kills the process on timeout', { skip }, async () => {
    const started = Date.now();
    await assert.rejects(ytdlp.runJson('slow', [], { timeoutMs: 300 }), /timed out/);
    assert.ok(Date.now() - started < 3000);
});

test('version() reports the binary version', { skip }, async () => {
    assert.equal(await ytdlp.version(), '2026.09.01');
});
