'use strict';

require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const i18n = require('../src/core/i18n');

const root = path.join(__dirname, '..');
const lookup = (obj, key) => key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), obj);
const placeholders = (text) => new Set([...String(text).matchAll(/\{(\w+)\}/g)].map((m) => m[1]));

function sourceFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? sourceFiles(full) : entry.name.endsWith('.js') ? [full] : [];
    });
}

const usedKeys = new Set();
for (const file of sourceFiles(path.join(root, 'src'))) {
    const code = fs.readFileSync(file, 'utf8');
    for (const match of code.matchAll(/'((?:commands|buttons|buttonhandler|modalhandler|musicplayer|musicmanager|errors|ui|youtube)\.[\w.]+)'/g)) {
        if (!/\.(com|hash)$/.test(match[1])) usedKeys.add(match[1]);
    }
}

test('every translation key used in the code exists in en.json', () => {
    const en = i18n.languages.get('en');
    assert.ok(usedKeys.size > 50, `found only ${usedKeys.size} keys`);
    const missing = [...usedKeys].filter((key) => typeof lookup(en, key) !== 'string' && !key.endsWith('.description'));
    assert.deepEqual(missing, []);
});

test('all 23 language files load and have a name', () => {
    assert.equal(i18n.languages.size, 23);
    for (const [code, data] of i18n.languages) assert.ok(data.language?.name, `${code} has no name`);
});

test('translations never use placeholders that English does not provide', () => {
    const en = i18n.languages.get('en');
    const problems = [];
    for (const [code, data] of i18n.languages) {
        for (const key of usedKeys) {
            const text = lookup(data, key);
            if (typeof text !== 'string') continue;
            const allowed = placeholders(lookup(en, key));
            for (const name of placeholders(text)) if (!allowed.has(name)) problems.push(`${code}:${key}:{${name}}`);
        }
    }
    assert.deepEqual(problems, []);
});

test('t() interpolates, falls back to English and strips emoji', () => {
    assert.equal(i18n.t('tr', 'buttonhandler.songs_shuffled', { count: 3 }), '3 şarkı karıştırıldı!');
    assert.equal(i18n.t('xx', 'buttons.skip'), 'Skip');
    assert.equal(i18n.t('en', 'does.not.exist'), 'does.not.exist');
    assert.equal(i18n.clean('✅ Done 🎵 now'), 'Done now');
    for (const [, data] of i18n.languages) {
        const json = JSON.stringify(data);
        assert.equal(/\p{Extended_Pictographic}/u.test(json), false);
    }
});

test('Discord locales map to language files', () => {
    assert.equal(i18n.fromDiscordLocale('tr'), 'tr');
    assert.equal(i18n.fromDiscordLocale('pt-BR'), 'pt');
    assert.equal(i18n.fromDiscordLocale('zh-TW'), 'zh_TW');
    assert.equal(i18n.fromDiscordLocale('xx'), null);
    assert.equal(i18n.guildLanguage(null, 'de'), 'de');
});

test('guild language setting persists and wins over the guild locale', async () => {
    await i18n.setGuildLanguage('999999999999999999', 'tr');
    assert.equal(i18n.guildLanguage('999999999999999999', 'de'), 'tr');
    await assert.rejects(i18n.setGuildLanguage('999999999999999999', 'xx'));
});

test('v16 language settings (database/languages.json) keep working without migration', async () => {
    const legacyRoot = fs.mkdtempSync(path.join(process.env.DATA_DIR, 'legacy-'));
    fs.mkdirSync(path.join(legacyRoot, 'database'));
    fs.writeFileSync(path.join(legacyRoot, 'database', 'languages.json'), JSON.stringify({
        servers: { '888888888888888888': { language: 'fr' }, '777777777777777777': { language: 'xx' } },
    }));
    i18n.resetLegacyCache();
    assert.equal(i18n.legacyLanguage('888888888888888888', legacyRoot), 'fr');
    assert.equal(i18n.guildLanguage('888888888888888888', 'de'), 'fr', 'v16 setting wins over the guild locale');
    assert.equal(i18n.guildLanguage('777777777777777777', 'de'), 'de', 'unknown v16 language falls back');
    await i18n.setGuildLanguage('888888888888888888', 'tr');
    assert.equal(i18n.guildLanguage('888888888888888888'), 'tr', 'a new choice overrides the v16 setting');
    i18n.resetLegacyCache();
});

test('the repository database/languages.json is valid', () => {
    i18n.resetLegacyCache();
    assert.equal(i18n.legacyLanguage('000000000000000000'), null);
});

test('error messages point to existing docs and the cookies setting', () => {
    for (const [code, data] of i18n.languages) {
        const text = JSON.stringify(data.errors);
        assert.equal(text.includes('YOUTUBE_FIX'), false, code);
        assert.ok(data.errors.youtube_bot_detection.includes('COOKIES_FILE'), code);
        assert.ok(data.errors.youtube_bot_detection.includes('README.md'), code);
    }
    assert.match(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /^#{2,3} YouTube: Sign in to confirm you're not a bot$/m);
});

test('every language translates every key used by the bot (no English fallback)', () => {
    const en = i18n.languages.get('en');
    const keys = [...usedKeys].filter((key) => typeof lookup(en, key) === 'string');
    const missing = [];
    for (const [code, data] of i18n.languages) {
        for (const key of keys) if (typeof lookup(data, key) !== 'string') missing.push(`${code}:${key}`);
    }
    assert.deepEqual(missing, []);
});
