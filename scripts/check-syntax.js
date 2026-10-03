'use strict';

// Syntax-check every source file without starting the bot: npm run check
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const files = [];
const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', '.git', 'data'].includes(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.js')) files.push(full);
    }
};
walk(root);

for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
for (const file of fs.readdirSync(path.join(root, 'languages'))) JSON.parse(fs.readFileSync(path.join(root, 'languages', file), 'utf8'));
console.log(`OK: ${files.length} files`);
