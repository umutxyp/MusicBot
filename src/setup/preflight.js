'use strict';

/**
 * Second startup step (npm packages are installed by now): configuration, Discord token,
 * yt-dlp, ffmpeg and voice libraries. Fixes what it can and explains everything else.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const config = require('../config');
const binaries = require('../core/binaries');
const report = require('./report');

const SNOWFLAKE = /^\d{17,20}$/;
const TOKEN = /^[\w-]{20,}\.[\w-]{4,}\.[\w-]{20,}$/;
const BROWSERS = ['brave', 'chrome', 'chromium', 'edge', 'firefox', 'opera', 'safari', 'vivaldi', 'whale'];

const TOKEN_STEPS = [
    '1. Open https://discord.com/developers/applications and select your bot',
    '2. Go to "Bot" and press "Reset Token", then copy the token',
    '3. Paste it into the .env file in the bot folder:  DISCORD_TOKEN=your_token',
];

const installHelp = (what) => ({
    darwin: `macOS: install Homebrew (https://brew.sh), then run: brew install ${what}`,
    win32: `Windows: run in a terminal: winget install ${what === 'ffmpeg' ? 'Gyan.FFmpeg' : 'yt-dlp.yt-dlp'}`,
    linux: `Linux (Ubuntu/Debian): sudo apt install ${what}`,
}[process.platform] || `Install ${what} with your system's package manager`);

/**
 * Create .env from .env.example on first start (unless the host provides variables directly).
 */
function ensureEnvFile(root = config.root) {
    const envFile = path.join(root, '.env');
    const example = path.join(root, '.env.example');
    if (fs.existsSync(envFile) || process.env.DISCORD_TOKEN) return false;
    if (!fs.existsSync(example)) return false;
    fs.copyFileSync(example, envFile);
    return true;
}

function validateProxy(url) {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:', 'socks4:', 'socks5:', 'socks5h:'].includes(parsed.protocol) && Boolean(parsed.hostname);
    } catch {
        return false;
    }
}

/**
 * Ask Discord who this token belongs to. Returns { ok, application } or { ok: false, reason }.
 */
async function checkToken(token, fetchImpl = fetch) {
    try {
        const response = await fetchImpl('https://discord.com/api/v10/applications/@me', {
            headers: { Authorization: `Bot ${token}` },
            signal: AbortSignal.timeout(10_000),
        });
        if (response.status === 401) return { ok: false, reason: 'invalid' };
        if (!response.ok) return { ok: false, reason: 'unreachable', detail: `HTTP ${response.status}` };
        return { ok: true, application: await response.json() };
    } catch (error) {
        return { ok: false, reason: 'unreachable', detail: error.message };
    }
}

function canWrite(dir) {
    try {
        fs.mkdirSync(dir, { recursive: true });
        const probe = path.join(dir, `.write-test-${crypto.randomBytes(4).toString('hex')}`);
        fs.writeFileSync(probe, 'ok');
        fs.rmSync(probe);
        return true;
    } catch {
        return false;
    }
}

function loads(name) {
    try {
        require(name);
        return true;
    } catch {
        return false;
    }
}

async function run({ fetchImpl = fetch } = {}) {
    let problems = 0;
    const fail = (label, lines) => {
        problems++;
        report.fail(label, lines);
    };

    // ─── .env and Discord ──────────────────────────────────────────────
    if (ensureEnvFile()) {
        fail('A .env file was created for you, but it still needs your bot token', TOKEN_STEPS);
        report.stop(problems);
    }

    const { token } = config.discord;
    if (!token) {
        fail('DISCORD_TOKEN is empty', TOKEN_STEPS);
    } else if (!TOKEN.test(token)) {
        fail('DISCORD_TOKEN does not look like a bot token', [
            'Copy the token again without spaces or quotes. It looks like: MTA1...xyz.Gh7k2a.abc...',
            ...TOKEN_STEPS,
        ]);
    } else {
        const result = await checkToken(token, fetchImpl);
        if (result.ok) {
            const app = result.application;
            const name = app.bot?.username ? `${app.bot.username}` : app.name;
            if (config.discord.clientId && config.discord.clientId !== app.id) {
                report.warn(`CLIENT_ID in .env (${config.discord.clientId}) belongs to another application`, [
                    `Using this bot's own id instead: ${app.id}. You can remove CLIENT_ID from .env.`,
                ]);
            }
            config.discord.clientId = app.id;
            process.env.CLIENT_ID = app.id; // shards read it from the environment
            report.ok('Discord token', `${name} (application ${app.id})`);
        } else if (result.reason === 'invalid') {
            fail('Discord rejected DISCORD_TOKEN (wrong or reset token)', TOKEN_STEPS);
        } else {
            if (!config.discord.clientId) {
                fail('Could not reach Discord to check the token', [
                    `Reason: ${result.detail}`,
                    'Check the internet connection of this machine (and firewall / proxy settings).',
                ]);
            } else {
                report.warn('Could not reach Discord to check the token, trying anyway', [`Reason: ${result.detail}`]);
            }
        }
    }

    if (config.discord.guildId && !SNOWFLAKE.test(config.discord.guildId)) {
        fail(`GUILD_ID "${config.discord.guildId}" is not a server id`, [
            'Leave GUILD_ID empty to register commands everywhere, or put a server id (Developer Mode > right click the server > Copy Server ID).',
        ]);
    }

    // ─── Settings ──────────────────────────────────────────────────────
    for (const proxy of config.proxies) {
        if (!validateProxy(proxy)) {
            fail(`PROXY_URL "${proxy}" is not a valid proxy address`, ['Use the form http://user:password@host:port (several can be separated by commas).']);
        }
    }
    if (config.ytdlp.cookiesFile) {
        const file = path.resolve(config.root, config.ytdlp.cookiesFile);
        if (!fs.existsSync(file)) {
            fail(`COOKIES_FILE "${config.ytdlp.cookiesFile}" does not exist`, [
                `Expected at: ${file}`,
                'Export your YouTube cookies to that file (see README.md, "YouTube: Sign in to confirm you\'re not a bot"),',
                'or remove COOKIES_FILE from .env.',
            ]);
        } else {
            config.ytdlp.cookiesFile = file;
            process.env.COOKIES_FILE = file;
            report.ok('YouTube cookies', file);
        }
    } else if (config.ytdlp.cookiesFromBrowser) {
        const browser = config.ytdlp.cookiesFromBrowser.split(':')[0].toLowerCase();
        if (!BROWSERS.includes(browser)) fail(`COOKIES_FROM_BROWSER "${config.ytdlp.cookiesFromBrowser}" is not a supported browser`, [`Use one of: ${BROWSERS.join(', ')}`]);
        else report.ok('YouTube cookies', `from ${browser}`);
    }
    if (!canWrite(config.dataDir)) {
        fail(`Cannot write to ${config.dataDir}`, ['The bot saves settings there. Give your user write permission to the bot folder.']);
    }

    // ─── Audio tools ───────────────────────────────────────────────────
    const [ytdlpPath, ffmpegPath] = await Promise.all([binaries.ensureYtDlp(), binaries.ensureFfmpeg()]);
    if (ytdlpPath) {
        report.ok('yt-dlp', (await binaries.probe(ytdlpPath)).output);
    } else {
        fail('yt-dlp is missing (needed for YouTube)', [
            'The automatic download failed. Check the internet connection and start again, or install it yourself:',
            installHelp('yt-dlp'),
            'and set YTDLP_PATH in .env if it is not on your PATH.',
        ]);
    }
    if (ffmpegPath) {
        const version = (await binaries.probe(ffmpegPath, ['-version'])).output?.split(/\r?\n/)[0].replace(/ Copyright.*$/, '');
        report.ok('ffmpeg', version);
    } else {
        fail('ffmpeg is missing (needed to play any audio)', [
            'The automatic download failed. Check the internet connection and start again, or install it yourself:',
            installHelp('ffmpeg'),
            'and set FFMPEG_PATH in .env if it is not on your PATH.',
        ]);
    }

    const voiceProblems = [
        !loads('@snazzah/davey') && '@snazzah/davey (Discord voice encryption)',
        !loads('opusscript') && 'opusscript (audio encoder)',
        !crypto.getCiphers().includes('aes-256-gcm') && 'aes-256-gcm support in Node.js',
    ].filter(Boolean);
    if (voiceProblems.length) {
        fail('Voice libraries do not load', [
            `Broken: ${voiceProblems.join(', ')}`,
            'Usually node_modules was copied from another computer. Delete the node_modules folder and start the bot again.',
        ]);
    } else {
        report.ok('Voice libraries', 'opus, encryption, DAVE');
    }

    // ─── Optional ──────────────────────────────────────────────────────
    if (!config.spotify.clientId || !config.spotify.clientSecret) {
        report.info('Spotify API keys not set', 'optional: large Spotify playlists load only their first 100 songs');
    }

    if (problems) report.stop(problems);
    console.log('');
}

module.exports = { run, ensureEnvFile, validateProxy, checkToken, TOKEN };
