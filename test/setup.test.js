'use strict';

require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const bootstrap = require('../src/setup/bootstrap');
const preflight = require('../src/setup/preflight');

function fakeProject(deps = {}) {
    const root = fs.mkdtempSync(path.join(process.env.DATA_DIR, 'project-'));
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'x', dependencies: deps }));
    fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, v: 1 }));
    return root;
}

function installPackage(root, name) {
    const dir = path.join(root, 'node_modules', name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name, version: '1.0.0', main: 'index.js' }));
    fs.writeFileSync(path.join(dir, 'index.js'), 'module.exports = 1;');
}

test('Node.js version gate is 22.12', () => {
    assert.equal(bootstrap.nodeVersionOk('22.11.0'), false);
    assert.equal(bootstrap.nodeVersionOk('20.18.1'), false);
    assert.equal(bootstrap.nodeVersionOk('22.12.0'), true);
    assert.equal(bootstrap.nodeVersionOk('24.0.0'), true);
});

test('packages are reinstalled when missing or when package files changed (after an update)', () => {
    const root = fakeProject({ 'left-pad': '^1.0.0' });
    assert.deepEqual(bootstrap.missingPackages(root), ['left-pad']);
    assert.equal(bootstrap.needsInstall(root), true);

    installPackage(root, 'left-pad');
    assert.deepEqual(bootstrap.missingPackages(root), []);
    assert.equal(bootstrap.needsInstall(root), true, 'never installed by the bot: install once');

    fs.writeFileSync(bootstrap.markerFile(root), bootstrap.dependencyFingerprint(root));
    assert.equal(bootstrap.needsInstall(root), false);

    fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, v: 2 }));
    assert.equal(bootstrap.needsInstall(root), true, 'a changed lockfile (git pull) triggers npm install');
});

test('the real project has all its packages installed', () => {
    assert.deepEqual(bootstrap.missingPackages(), []);
});

test('.env is created from .env.example on first start, never overwritten', () => {
    const root = fakeProject();
    fs.writeFileSync(path.join(root, '.env.example'), 'DISCORD_TOKEN=\n');
    const saved = process.env.DISCORD_TOKEN;
    delete process.env.DISCORD_TOKEN;
    try {
        assert.equal(preflight.ensureEnvFile(root), true);
        assert.equal(fs.readFileSync(path.join(root, '.env'), 'utf8'), 'DISCORD_TOKEN=\n');
        fs.writeFileSync(path.join(root, '.env'), 'DISCORD_TOKEN=mine\n');
        assert.equal(preflight.ensureEnvFile(root), false);
        assert.equal(fs.readFileSync(path.join(root, '.env'), 'utf8'), 'DISCORD_TOKEN=mine\n');

        const hosted = fakeProject();
        fs.writeFileSync(path.join(hosted, '.env.example'), '');
        process.env.DISCORD_TOKEN = 'from-hosting-panel';
        assert.equal(preflight.ensureEnvFile(hosted), false, 'hosting panels provide variables without .env');
    } finally {
        if (saved === undefined) delete process.env.DISCORD_TOKEN;
        else process.env.DISCORD_TOKEN = saved;
    }
});

test('proxy and token format validation', () => {
    assert.equal(preflight.validateProxy('http://user:pass@1.2.3.4:8080'), true);
    assert.equal(preflight.validateProxy('socks5://host:1080'), true);
    assert.equal(preflight.validateProxy('not a proxy'), false);
    assert.equal(preflight.validateProxy('ftp://host'), false);
    // Built at runtime so no token-shaped string is ever committed (GitHub push protection).
    const tokenShaped = ['A'.repeat(26), 'B'.repeat(6), 'C'.repeat(38)].join('.');
    assert.equal(preflight.TOKEN.test(tokenShaped), true);
    assert.equal(preflight.TOKEN.test('Bot abc'), false);
    assert.equal(preflight.TOKEN.test(''), false);
});

test('checkToken: valid, rejected and unreachable', async () => {
    const ok = await preflight.checkToken('t', async () => new Response(JSON.stringify({ id: '123456789012345678', name: 'Beatra' }), { status: 200 }));
    assert.equal(ok.ok, true);
    assert.equal(ok.application.id, '123456789012345678');
    assert.deepEqual(await preflight.checkToken('t', async () => new Response('{}', { status: 401 })), { ok: false, reason: 'invalid' });
    const down = await preflight.checkToken('t', async () => { throw new Error('getaddrinfo ENOTFOUND'); });
    assert.equal(down.reason, 'unreachable');
    assert.match(down.detail, /ENOTFOUND/);
});
