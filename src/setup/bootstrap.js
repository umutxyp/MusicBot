'use strict';

/**
 * First startup step: Node.js version and npm packages. Uses only Node built-ins because it
 * runs before (or instead of) `npm install`.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const report = require('./report');

const ROOT = path.join(__dirname, '..', '..');
const MIN_NODE = [22, 12, 0];

function nodeVersionOk(version = process.versions.node) {
    const parts = version.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (parts[i] !== MIN_NODE[i]) return parts[i] > MIN_NODE[i];
    }
    return true;
}

/**
 * Fingerprint of what should be installed: changes whenever package.json or the lockfile change
 * (for example after updating the bot).
 */
function dependencyFingerprint(root = ROOT) {
    const hash = crypto.createHash('sha256');
    for (const file of ['package.json', 'package-lock.json']) {
        const full = path.join(root, file);
        if (fs.existsSync(full)) hash.update(fs.readFileSync(full));
    }
    return hash.digest('hex');
}

const markerFile = (root) => path.join(root, 'node_modules', '.musicbot-installed');

/**
 * Required packages that cannot be loaded from this folder.
 */
function missingPackages(root = ROOT) {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    return Object.keys(pkg.dependencies || {}).filter((name) => {
        try {
            require.resolve(`${name}/package.json`, { paths: [root] });
            return false;
        } catch {
            try {
                require.resolve(name, { paths: [root] });
                return false;
            } catch {
                return true;
            }
        }
    });
}

function needsInstall(root = ROOT) {
    if (missingPackages(root).length) return true;
    const marker = markerFile(root);
    return !fs.existsSync(marker) || fs.readFileSync(marker, 'utf8') !== dependencyFingerprint(root);
}

function runNpmInstall(root = ROOT) {
    const args = ['install', '--no-audit', '--no-fund'];
    // When started through npm, reuse that npm; otherwise call npm from PATH.
    const npmCli = process.env.npm_execpath;
    const result = npmCli && npmCli.endsWith('.js')
        ? spawnSync(process.execPath, [npmCli, ...args], { cwd: root, stdio: 'inherit' })
        : spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
    if (result.error) return { ok: false, error: result.error.code === 'ENOENT' ? 'npm was not found' : result.error.message };
    return { ok: result.status === 0, error: result.status === 0 ? null : `npm install exited with code ${result.status}` };
}

function run(root = ROOT) {
    report.title('Beatra startup check');

    if (!nodeVersionOk()) {
        report.fail(`Node.js ${process.versions.node} is too old (22.12 or newer is required)`, [
            'Install the current LTS version from https://nodejs.org (Windows / macOS installer),',
            'or on macOS: brew install node   |   on Ubuntu/Debian: see https://nodejs.org/en/download',
            'Then close this window, open a new terminal and start the bot again.',
        ]);
        report.stop(1);
    }
    report.ok(`Node.js ${process.versions.node}`);

    if (needsInstall(root)) {
        report.info('Installing / updating npm packages (first start or after an update)...');
        const result = runNpmInstall(root);
        const missing = missingPackages(root);
        if (!result.ok || missing.length) {
            report.fail('npm packages could not be installed', [
                result.error || `Missing: ${missing.join(', ')}`,
                'Check your internet connection, then run these commands in the bot folder:',
                process.platform === 'win32' ? '  rmdir /s /q node_modules' : '  rm -rf node_modules',
                '  npm install',
            ]);
            report.stop(1);
        }
        fs.writeFileSync(markerFile(root), dependencyFingerprint(root));
    }
    report.ok('npm packages');
}

module.exports = { run, nodeVersionOk, needsInstall, missingPackages, dependencyFingerprint, markerFile };
