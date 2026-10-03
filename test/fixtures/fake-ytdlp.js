#!/usr/bin/env node
'use strict';

// Stand-in for yt-dlp used by tests. Behaviour depends on the target (last argument).
const fs = require('node:fs');

const args = process.argv.slice(2);
const target = args[args.length - 1];
if (process.env.FAKE_YTDLP_LOG) fs.appendFileSync(process.env.FAKE_YTDLP_LOG, `${JSON.stringify(args)}\n`);

// Streaming mode used by the relay: `-o -` writes media bytes to stdout.
const out = args.indexOf('-o');
if (out !== -1 && args[out + 1] === '-') {
    const infoFile = args[args.indexOf('--load-info-json') + 1];
    const info = args.includes('--load-info-json') ? JSON.parse(fs.readFileSync(infoFile, 'utf8')) : { url: target };
    if (String(info.url).includes('fail')) {
        process.stderr.write('ERROR: unable to download video data: HTTP Error 403: Forbidden\n');
        process.exit(1);
    }
    const delay = String(info.url).includes('slow') ? 10_000 : 0;
    setTimeout(() => process.stdout.write(Buffer.alloc(50_000, 7)), delay);
    return;
}

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
