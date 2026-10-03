#!/usr/bin/env node
'use strict';

// Stand-in for yt-dlp used by tests. Behaviour depends on the target (last argument).
const fs = require('node:fs');

const args = process.argv.slice(2);
const target = args[args.length - 1];
if (process.env.FAKE_YTDLP_LOG) fs.appendFileSync(process.env.FAKE_YTDLP_LOG, `${JSON.stringify(args)}\n`);

if (args[0] === '--version') {
    process.stdout.write('2026.09.01\n');
    process.exit(0);
}
if (target === 'slow') {
    setTimeout(() => process.stdout.write('{}'), 10_000);
} else if (target === 'fail') {
    process.stderr.write('WARNING: something\nERROR: [youtube] abc: Sign in to confirm you’re not a bot\n');
    process.exit(1);
} else if (target === 'invalid') {
    process.stdout.write('not json');
} else {
    process.stderr.write('WARNING: noisy warning that must not break JSON\n');
    process.stdout.write(JSON.stringify({ id: 'abcdefghijk', title: 'Echo', target, url: 'https://rr1.googlevideo.com/videoplayback?expire=9999999999' }));
}
