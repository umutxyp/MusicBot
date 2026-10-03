'use strict';

/**
 * postinstall: download yt-dlp and ffmpeg right away. The bot also does this on start,
 * so a skipped or failed install script never breaks anything.
 */
const binaries = require('../src/core/binaries');

Promise.all([binaries.ensureYtDlp(), binaries.ensureFfmpeg()])
    .catch((error) => console.warn('Binary setup will be retried on start:', error.message))
    .finally(() => process.exit(0));
