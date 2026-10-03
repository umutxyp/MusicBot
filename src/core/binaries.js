'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const config = require('../config');
const log = require('./logger').createLogger('setup');

const { extractZip } = require('./unzip');

const BIN_DIR = config.binDir;
const INSTALL_DIR = path.join(BIN_DIR, 'yt-dlp-dist');
const UPDATE_MARKER = path.join(config.dataDir, 'yt-dlp.checked');
const UPDATE_INTERVAL_MS = 24 * 3600_000;
const RELEASES = 'https://github.com/yt-dlp/yt-dlp/releases';
const DOWNLOAD_BASE = process.env.YTDLP_DOWNLOAD_BASE || `${RELEASES}/latest/download`;

/**
 * Official yt-dlp build for this machine, as a ZIP of the program folder ("onedir").
 * These need no Python, and unlike the single-file builds they do not unpack themselves on
 * every run, which made each yt-dlp call take seconds (much longer on macOS).
 */
function ytDlpAsset(platform = process.platform, arch = process.arch, musl = isMusl()) {
    if (platform === 'win32') return { x64: 'yt-dlp_win.zip', ia32: 'yt-dlp_win_x86.zip', arm64: 'yt-dlp_win_arm64.zip' }[arch] || null;
    if (platform === 'darwin') return 'yt-dlp_macos.zip';
    if (platform === 'linux') {
        if (arch === 'x64') return musl ? 'yt-dlp_musllinux.zip' : 'yt-dlp_linux.zip';
        if (arch === 'arm64') return musl ? 'yt-dlp_musllinux_aarch64.zip' : 'yt-dlp_linux_aarch64.zip';
        if (arch === 'arm' && !musl) return 'yt-dlp_linux_armv7l.zip';
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
    return path.join(INSTALL_DIR, platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
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

async function download(url, { minBytes = 1024 * 1024 } = {}) {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10 * 60_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length < minBytes) throw new Error(`Download from ${url} is too small (${data.length} bytes)`);
    return data;
}

/**
 * Download and unpack yt-dlp into bin/yt-dlp-dist, replacing the previous version only once
 * the new one is known to run.
 */
async function installYtDlp(asset = ytDlpAsset()) {
    if (!asset) throw new Error(`No yt-dlp build for ${process.platform}/${process.arch}`);
    const zip = await download(`${DOWNLOAD_BASE}/${asset}`);
    const staging = path.join(BIN_DIR, `.yt-dlp-${process.pid}`);
    await fsp.rm(staging, { recursive: true, force: true });
    try {
        extractZip(zip, staging);
        const program = fs.readdirSync(staging, { withFileTypes: true })
            .find((entry) => entry.isFile() && entry.name.startsWith('yt-dlp'));
        if (!program) throw new Error('The yt-dlp archive does not contain the program');
        const executable = path.join(staging, path.basename(localYtDlpPath()));
        if (program.name !== path.basename(executable)) await fsp.rename(path.join(staging, program.name), executable);
        if (process.platform !== 'win32') await fsp.chmod(executable, 0o755);
        const check = await probe(executable);
        if (!check.ok) throw new Error(`the downloaded yt-dlp does not run: ${check.error}`);

        const previous = `${INSTALL_DIR}.old-${process.pid}`;
        if (fs.existsSync(INSTALL_DIR)) await fsp.rename(INSTALL_DIR, previous);
        await fsp.rename(staging, INSTALL_DIR);
        await fsp.rm(previous, { recursive: true, force: true });
        // Single-file builds used by earlier versions of the bot.
        for (const old of ['yt-dlp', 'yt-dlp.exe']) {
            const file = path.join(BIN_DIR, old);
            if (fs.existsSync(file) && fs.statSync(file).isFile()) await fsp.rm(file, { force: true });
        }
        await markChecked();
        return check.output;
    } finally {
        await fsp.rm(staging, { recursive: true, force: true });
    }
}

/**
 * Make sure a working yt-dlp exists. Downloads it into bin/ when needed, so it works even when
 * npm skipped install scripts or the system Python is too old.
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
        log.warn(`bin/yt-dlp-dist does not run (${result.error}), downloading it again`);
    }

    if (ytDlpAsset()) {
        try {
            log.info(`Downloading yt-dlp (${ytDlpAsset()})...`);
            const version = await installYtDlp();
            log.ok(`yt-dlp ${version} installed`);
            return local;
        } catch (error) {
            log.error(`Could not install yt-dlp: ${error.message}`);
        }
    }

    const system = await probe('yt-dlp');
    if (system.ok) return 'yt-dlp';
    log.error('No working yt-dlp found. YouTube will not play. Download it from https://github.com/yt-dlp/yt-dlp/releases and set YTDLP_PATH.');
    return null;
}

async function markChecked() {
    await fsp.mkdir(config.dataDir, { recursive: true });
    await fsp.writeFile(UPDATE_MARKER, new Date().toISOString());
}

/**
 * Latest yt-dlp version, read from the redirect of the "latest release" page
 * (no GitHub API, so no API rate limit).
 */
async function latestYtDlpVersion() {
    const response = await fetch(`${RELEASES}/latest`, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15_000) });
    const tag = (response.headers.get('location') || '').match(/\/tag\/([^/?#]+)/)?.[1];
    if (!tag) throw new Error(`unexpected response (${response.status})`);
    return decodeURIComponent(tag);
}

/**
 * yt-dlp must stay current for YouTube to keep working: check once a day and install a newer
 * version before the shards start (nothing is running yt-dlp at that moment).
 */
async function updateYtDlp() {
    const local = localYtDlpPath();
    if (config.ytdlp.path || !fs.existsSync(local) || !ytDlpAsset()) return null;
    try {
        if (Date.now() - fs.statSync(UPDATE_MARKER).mtimeMs < UPDATE_INTERVAL_MS) return null;
    } catch {
        // never checked
    }
    try {
        const [current, latest] = await Promise.all([probe(local), latestYtDlpVersion()]);
        if (current.ok && current.output === latest) {
            await markChecked();
            return null;
        }
        log.info(`Updating yt-dlp ${current.output || ''} -> ${latest}...`);
        const version = await installYtDlp();
        log.ok(`yt-dlp ${version} installed`);
        return version;
    } catch (error) {
        log.warn(`yt-dlp update check failed (will retry on next start): ${error.message}`);
        return null;
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

module.exports = {
    ensureYtDlp, updateYtDlp, installYtDlp, latestYtDlpVersion, ensureFfmpeg,
    ytDlpAsset, localYtDlpPath, probe, download, BIN_DIR, INSTALL_DIR,
};
