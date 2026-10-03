'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const config = require('../config');
const { Semaphore } = require('../core/cache');
const log = require('../core/logger').createLogger('yt-dlp');

const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';

/**
 * Locate yt-dlp: YTDLP_PATH > binary downloaded by youtube-dl-exec > yt-dlp on PATH.
 */
function resolveBinary() {
    if (config.ytdlp.path) return config.ytdlp.path;
    try {
        const pkgDir = path.dirname(require.resolve('youtube-dl-exec/package.json'));
        const bundled = path.join(pkgDir, 'bin', binaryName);
        if (fs.existsSync(bundled)) return bundled;
    } catch {
        // youtube-dl-exec not installed
    }
    return binaryName;
}

const binary = resolveBinary();
const limiter = new Semaphore(config.ytdlp.concurrency);

/**
 * Pick a proxy for a guild. Every guild sticks to the same proxy so stream URLs (which
 * YouTube locks to the requesting IP) are fetched through the proxy that created them.
 */
function proxyFor(key, proxies = config.proxies) {
    if (!proxies.length) return null;
    if (proxies.length === 1 || !key) return proxies[0];
    let hash = 0;
    for (const char of String(key)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return proxies[hash % proxies.length];
}

/**
 * Base arguments shared by every yt-dlp call.
 */
function baseArgs({ proxy = null, settings = config.ytdlp } = {}) {
    const args = [
        '--ignore-config',
        '--no-warnings',
        '--no-progress',
        '--no-check-certificates',
        '--socket-timeout', '10',
        '--retries', '2',
        '--js-runtimes', `node:${process.execPath}`,
    ];

    if (settings.cookiesFile) args.push('--cookies', settings.cookiesFile);
    else if (settings.cookiesFromBrowser) args.push('--cookies-from-browser', settings.cookiesFromBrowser);

    const extractorArgs = [];
    if (settings.poToken) extractorArgs.push(`youtube:po_token=web.gvs+${settings.poToken};player_client=web,default`);
    if (settings.extractorArgs) extractorArgs.push(settings.extractorArgs);
    for (const value of extractorArgs) args.push('--extractor-args', value);

    if (proxy) args.push('--proxy', proxy);
    return args;
}

class YtDlpError extends Error {
    constructor(message, stderr = '') {
        super(message);
        this.name = 'YtDlpError';
        this.stderr = stderr;
    }
}

/**
 * Turn yt-dlp's stderr into a short, user-safe reason.
 */
function cleanError(stderr) {
    const line = String(stderr)
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter((item) => item.startsWith('ERROR:'))
        .pop();
    const text = (line || String(stderr).trim().split(/\r?\n/).pop() || 'yt-dlp failed')
        .replace(/^ERROR:\s*/, '')
        .replace(/^\[[^\]]+\]\s*[\w-]+:\s*/, '');
    return text.slice(0, 300);
}

/**
 * Run yt-dlp and parse the JSON it prints. stdout and stderr are kept apart so warnings
 * never corrupt the JSON.
 */
function runJson(target, extraArgs = [], { proxy = null, priority = 'high', timeoutMs = config.ytdlp.timeoutMs } = {}) {
    const args = [...baseArgs({ proxy }), ...extraArgs, '--dump-single-json', '--', target];

    return limiter.run(() => new Promise((resolve, reject) => {
        const started = Date.now();
        let stdout = '';
        let stderr = '';
        let settled = false;
        const child = spawn(binary, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });

        const finish = (error, value) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error) reject(error);
            else resolve(value);
        };

        const timer = setTimeout(() => {
            child.kill('SIGKILL');
            finish(new YtDlpError(`yt-dlp timed out after ${Math.round(timeoutMs / 1000)}s`));
        }, timeoutMs);

        child.stdout.setEncoding('utf8').on('data', (data) => (stdout += data));
        child.stderr.setEncoding('utf8').on('data', (data) => (stderr += data));
        child.on('error', (error) => {
            const hint = error.code === 'ENOENT' ? ' (yt-dlp binary not found, run "npm install" or set YTDLP_PATH)' : '';
            finish(new YtDlpError(`${error.message}${hint}`));
        });
        child.on('close', (code) => {
            log.debug(`${code} in ${Date.now() - started}ms: ${target}`);
            if (code !== 0) return finish(new YtDlpError(cleanError(stderr), stderr));
            try {
                finish(null, JSON.parse(stdout));
            } catch {
                finish(new YtDlpError('yt-dlp returned invalid JSON', stderr));
            }
        });
    }), { priority });
}

async function version() {
    return new Promise((resolve) => {
        const child = spawn(binary, ['--version'], { windowsHide: true });
        let out = '';
        child.stdout.on('data', (data) => (out += data));
        child.on('error', () => resolve(null));
        child.on('close', (code) => resolve(code === 0 ? out.trim() : null));
    });
}

module.exports = { runJson, baseArgs, proxyFor, cleanError, version, YtDlpError, binary };
