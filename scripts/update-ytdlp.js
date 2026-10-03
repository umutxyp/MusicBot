'use strict';

/**
 * postinstall: keep the yt-dlp binary (downloaded by youtube-dl-exec) up to date.
 * YouTube changes often and an outdated yt-dlp is the most common cause of playback errors.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

let binary;
try {
    const dir = path.join(path.dirname(require.resolve('youtube-dl-exec/package.json')), 'bin');
    binary = path.join(dir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
} catch {
    process.exit(0);
}

if (!fs.existsSync(binary)) {
    console.log('yt-dlp binary not downloaded yet, skipping update.');
    process.exit(0);
}

try {
    execFileSync(binary, ['-U'], { stdio: 'inherit', timeout: 120_000 });
} catch {
    console.warn('yt-dlp self-update skipped (offline or already up to date).');
}
