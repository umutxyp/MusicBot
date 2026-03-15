/**
 * Postinstall script: updates the bundled yt-dlp binary to the latest version.
 * This runs automatically after `npm install` to keep YouTube extraction working.
 * YouTube frequently changes their API; an outdated yt-dlp breaks music search.
 */
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const binDir = path.join(__dirname, '..', 'node_modules', 'youtube-dl-exec', 'bin');
const binary = process.platform === 'win32'
    ? path.join(binDir, 'yt-dlp.exe')
    : path.join(binDir, 'yt-dlp');

if (!fs.existsSync(binary)) {
    console.log('ℹ️  yt-dlp binary not found yet, skipping update (will run after package installs).');
    process.exit(0);
}

console.log('🔄 Updating yt-dlp to latest version...');
try {
    execFileSync(binary, ['-U'], { stdio: 'inherit' });
} catch (e) {
    // yt-dlp exits with code 1 when an update was applied on some platforms — not an error
    if (e.status !== 1) {
        console.warn('⚠️  yt-dlp update skipped (network issue or already up to date).');
    }
}
