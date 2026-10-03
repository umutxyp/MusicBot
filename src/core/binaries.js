'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const config = require('../config');
const log = require('./logger').createLogger('setup');

const BIN_DIR = config.binDir;
const UPDATE_MARKER = path.join(config.dataDir, 'yt-dlp.updated');
const UPDATE_INTERVAL_MS = 24 * 3600_000;
const DOWNLOAD_BASE = process.env.YTDLP_DOWNLOAD_BASE || 'https://github.com/yt-dlp/yt-dlp/releases/latest/download';

/**
 * Official self-contained yt-dlp build for this machine. These do not need Python
 * (the plain "yt-dlp" file does, and many systems ship a Python that is too old).
 */
function ytDlpAsset(platform = process.platform, arch = process.arch, musl = isMusl()) {
    if (platform === 'win32') return { x64: 'yt-dlp.exe', ia32: 'yt-dlp_x86.exe', arm64: 'yt-dlp_arm64.exe' }[arch] || null;
    if (platform === 'darwin') return 'yt-dlp_macos';
    if (platform === 'linux') {
        if (arch === 'x64') return musl ? 'yt-dlp_musllinux' : 'yt-dlp_linux';
        if (arch === 'arm64') return musl ? 'yt-dlp_musllinux_aarch64' : 'yt-dlp_linux_aarch64';
    }
    return null;
}

function isMusl() {
    if (process.platform !== 'linux') return false;
    try {
        return !process.report.getReport().header.glibcVersionRuntime;
    } catch {
        return false;
    }
}

/**
 * Where the bot's own yt-dlp lives (YTDLP_PATH overrides it).
 */
function localYtDlpPath(platform = process.platform) {
    return path.join(BIN_DIR, platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
}

/**
 * Run `binary args` and resolve { ok, output, error } without throwing.
 */
function probe(binary, args = ['--version'], timeoutMs = 60_000) {
    return new Promise((resolve) => {
        let out = '';
        let err = '';
        let child;
        try {
            child = spawn(binary, args, { windowsHide: true });
        } catch (error) {
            resolve({ ok: false, error: error.message });
            return;
        }
        const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
        child.stdout?.on('data', (data) => (out += data));
        child.stderr?.on('data', (data) => (err += data));
        child.on('error', (error) => {
            clearTimeout(timer);
            resolve({ ok: false, error: error.code === 'ENOENT' ? 'not found' : error.message });
        });
        child.on('close', (code) => {
            clearTimeout(timer);
            const lastLine = (err || out).trim().split(/\r?\n/).pop() || `exit code ${code}`;
            resolve(code === 0 ? { ok: true, output: out.trim() } : { ok: false, error: lastLine });
        });
    });
}

async function download(url, destination) {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(5 * 60_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length < 1024 * 1024) throw new Error(`Download from ${url} is too small (${data.length} bytes)`);
    await fsp.mkdir(path.dirname(destination), { recursive: true });
    const tmp = `${destination}.${process.pid}.download`;
    await fsp.writeFile(tmp, data, { mode: 0o755 });
    await fsp.rename(tmp, destination);
}

/**
 * Make sure a working yt-dlp exists. Downloads the self-contained build into bin/ when needed,
 * so it works even when npm skipped install scripts or the system Python is too old.
 */
async function ensureYtDlp() {
    if (config.ytdlp.path) {
        const result = await probe(config.ytdlp.path);
        if (!result.ok) log.error(`YTDLP_PATH="${config.ytdlp.path}" does not work: ${result.error}`);
        return result.ok ? config.ytdlp.path : null;
    }

    const local = localYtDlpPath();
    if (fs.existsSync(local)) {
        const result = await probe(local);
        if (result.ok) return local;
        log.warn(`bin/${path.basename(local)} does not run (${result.error}), downloading it again`);
        await fsp.rm(local, { force: true });
    }

    const asset = ytDlpAsset();
    if (asset) {
        try {
            log.info(`Downloading yt-dlp (${asset})...`);
            await download(`${DOWNLOAD_BASE}/${asset}`, local);
            const result = await probe(local);
            if (result.ok) {
                log.ok(`yt-dlp ${result.output} installed`);
                await markUpdated();
                return local;
            }
            log.error(`The downloaded yt-dlp does not run: ${result.error}`);
            await fsp.rm(local, { force: true });
        } catch (error) {
            log.error(`Could not download yt-dlp: ${error.message}`);
        }
    }

    const system = await probe('yt-dlp');
    if (system.ok) return 'yt-dlp';
    log.error('No working yt-dlp found. YouTube will not play. Download it from https://github.com/yt-dlp/yt-dlp/releases and set YTDLP_PATH.');
    return null;
}

async function markUpdated() {
    await fsp.mkdir(config.dataDir, { recursive: true });
    await fsp.writeFile(UPDATE_MARKER, new Date().toISOString());
}

/**
 * yt-dlp must stay current for YouTube to keep working: self-update at most once a day.
 */
async function updateYtDlp() {
    const local = localYtDlpPath();
    if (config.ytdlp.path || !fs.existsSync(local)) return;
    try {
        const last = fs.statSync(UPDATE_MARKER).mtimeMs;
        if (Date.now() - last < UPDATE_INTERVAL_MS) return;
    } catch {
        // never updated
    }
    const result = await probe(local, ['-U'], 5 * 60_000);
    if (result.ok) {
        const line = result.output.split(/\r?\n/).pop();
        log.info(`yt-dlp: ${line}`);
        await markUpdated();
    } else {
        log.warn(`yt-dlp self-update failed: ${result.error}`);
    }
}

/**
 * ffmpeg: FFMPEG_PATH > ffmpeg-static (installed on demand) > ffmpeg on PATH.
 */
async function ensureFfmpeg() {
    if (config.ffmpegPath) {
        const result = await probe(config.ffmpegPath, ['-version']);
        if (!result.ok) log.error(`FFMPEG_PATH="${config.ffmpegPath}" does not work: ${result.error}`);
        return result.ok ? config.ffmpegPath : null;
    }

    let bundled = null;
    try {
        bundled = require('ffmpeg-static');
    } catch {
        // optional dependency not installed
    }
    if (bundled) {
        if (!fs.existsSync(bundled)) {
            // npm may have skipped ffmpeg-static's install script: run it now.
            log.info('Downloading ffmpeg...');
            const installer = path.join(path.dirname(require.resolve('ffmpeg-static/package.json')), 'install.js');
            const result = await probe(process.execPath, [installer], 10 * 60_000);
            if (!result.ok) log.warn(`Could not download ffmpeg: ${result.error}`);
        }
        if (fs.existsSync(bundled) && (await probe(bundled, ['-version'])).ok) return bundled;
    }

    if ((await probe('ffmpeg', ['-version'])).ok) return 'ffmpeg';
    log.error('No working ffmpeg found. Install ffmpeg or set FFMPEG_PATH.');
    return null;
}

module.exports = { ensureYtDlp, updateYtDlp, ensureFfmpeg, ytDlpAsset, localYtDlpPath, probe, download, BIN_DIR };
