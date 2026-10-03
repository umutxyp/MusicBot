'use strict';

const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');
const { JsonStore } = require('./store');
const log = require('./logger').createLogger('i18n');

const LANG_DIR = path.join(__dirname, '..', '..', 'languages');
const FALLBACK = 'en';

const languages = new Map();
const discordLocaleMap = new Map();

function lookup(object, key) {
    return key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), object);
}

function load() {
    languages.clear();
    discordLocaleMap.clear();
    for (const file of fs.readdirSync(LANG_DIR).filter((name) => name.endsWith('.json')).sort()) {
        const code = file.slice(0, -5);
        try {
            const data = JSON.parse(fs.readFileSync(path.join(LANG_DIR, file), 'utf8'));
            languages.set(code, data);
            for (const locale of data.meta?.discordLocales || []) discordLocaleMap.set(locale, code);
        } catch (error) {
            log.error(`Invalid language file ${file}:`, error.message);
        }
    }
    if (!languages.has(FALLBACK)) throw new Error('languages/en.json is required');
}

load();

const defaultLanguage = languages.has(config.bot.defaultLanguage) ? config.bot.defaultLanguage : FALLBACK;
let settings = null;
const getSettings = () => (settings ??= new JsonStore(path.join(config.dataDir, 'guilds')));

/**
 * Translate key for a language code. Missing keys fall back to English, then to the key itself.
 */
function t(lang, key, vars = {}) {
    let text = lookup(languages.get(lang), key);
    if (typeof text !== 'string') text = lookup(languages.get(FALLBACK), key);
    if (typeof text !== 'string') return key;
    return text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] !== undefined ? String(vars[name]) : match));
}

function fromDiscordLocale(locale) {
    if (!locale) return null;
    return discordLocaleMap.get(locale) || null;
}

/**
 * Language for a guild: explicit setting > guild's Discord locale > default.
 */
function guildLanguage(guildId, guildLocale) {
    const stored = guildId ? getSettings().get(guildId)?.language : null;
    if (stored && languages.has(stored)) return stored;
    return fromDiscordLocale(guildLocale) || defaultLanguage;
}

async function setGuildLanguage(guildId, code) {
    if (!languages.has(code)) throw new Error(`Unknown language: ${code}`);
    const store = getSettings();
    await store.set(guildId, { ...(store.get(guildId) || {}), language: code });
}

/**
 * Translator bound to a guild.
 */
function forGuild(guild) {
    const lang = guildLanguage(guild?.id, guild?.preferredLocale);
    const translate = (key, vars) => t(lang, key, vars);
    translate.lang = lang;
    return translate;
}

function list() {
    return [...languages.entries()].map(([code, data]) => ({ code, name: data.meta?.name || code }));
}

/**
 * Localizations of a key for every language that defines it (for slash command descriptions).
 */
function localizations(key) {
    const out = {};
    for (const [code, data] of languages) {
        const text = lookup(data, key);
        if (typeof text !== 'string' || code === FALLBACK) continue;
        for (const locale of data.meta?.discordLocales || []) out[locale] = text;
    }
    return out;
}

/**
 * One-time import of the language settings written by older versions (database/languages.json).
 */
function migrateLegacy(rootDir = config.root) {
    const legacyFile = path.join(rootDir, 'database', 'languages.json');
    const marker = path.join(config.dataDir, '.languages-migrated');
    if (!fs.existsSync(legacyFile) || fs.existsSync(marker)) return 0;
    let count = 0;
    try {
        const servers = JSON.parse(fs.readFileSync(legacyFile, 'utf8'))?.servers || {};
        const store = getSettings();
        for (const [guildId, value] of Object.entries(servers)) {
            if (/^\d{15,25}$/.test(guildId) && languages.has(value?.language) && !store.get(guildId)) {
                store.set(guildId, { language: value.language });
                count++;
            }
        }
        fs.mkdirSync(config.dataDir, { recursive: true });
        fs.writeFileSync(marker, new Date().toISOString());
        if (count) log.ok(`Imported ${count} legacy language setting(s)`);
    } catch (error) {
        log.warn('Could not import legacy language settings:', error.message);
    }
    return count;
}

module.exports = {
    t,
    forGuild,
    guildLanguage,
    setGuildLanguage,
    fromDiscordLocale,
    list,
    localizations,
    migrateLegacy,
    languages,
    FALLBACK,
    get defaultLanguage() {
        return defaultLanguage;
    },
};
