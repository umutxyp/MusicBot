'use strict';

const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');
const { JsonStore } = require('./store');
const log = require('./logger').createLogger('i18n');

const LANG_DIR = path.join(__dirname, '..', '..', 'languages');
const FALLBACK = 'en';

// Discord locale -> language file code
const DISCORD_LOCALES = {
    'en-US': 'en', 'en-GB': 'en', tr: 'tr', de: 'de', 'es-ES': 'es', 'es-419': 'es', fr: 'fr', it: 'it',
    nl: 'nl', pl: 'pl', 'pt-BR': 'pt', ru: 'ru', 'sv-SE': 'sv', no: 'no', da: 'da', fi: 'fi', cs: 'cs',
    ja: 'ja', ko: 'ko', 'zh-CN': 'zh_CN', 'zh-TW': 'zh_TW', hi: 'hi', th: 'th', id: 'id',
};

// Emoji, flags, keycaps and variation selectors are stripped from translations for a clean UI.
const EMOJI = /(?:\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[\u{FE0E}\u{FE0F}\u{20E3}\u{200D}])/gu;

function clean(text) {
    return text.replace(EMOJI, '').replace(/[ \t]{2,}/g, ' ').replace(/^[ \t]+/gm, '').trim();
}

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
            for (const [locale, target] of Object.entries(DISCORD_LOCALES)) {
                if (target === code) discordLocaleMap.set(locale, code);
            }
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
    return clean(text).replace(/\{(\w+)\}/g, (match, name) => (vars[name] !== undefined ? String(vars[name]) : match));
}

function fromDiscordLocale(locale) {
    if (!locale) return null;
    return discordLocaleMap.get(locale) || null;
}

/**
 * Language settings written by v16 and older (database/languages.json). Read-only: they keep
 * working after an upgrade without any migration step, and new choices are saved per guild.
 */
let legacy = null;
function legacyLanguage(guildId, rootDir = config.root) {
    if (legacy === null) {
        legacy = {};
        try {
            legacy = JSON.parse(fs.readFileSync(path.join(rootDir, 'database', 'languages.json'), 'utf8'))?.servers || {};
        } catch (error) {
            if (error.code !== 'ENOENT') log.warn('Could not read database/languages.json:', error.message);
        }
    }
    return legacy[guildId]?.language || null;
}

/**
 * Language for a guild: saved setting > v16 setting > guild's Discord locale > default.
 */
function guildLanguage(guildId, guildLocale) {
    const stored = guildId ? getSettings().get(guildId)?.language : null;
    if (stored && languages.has(stored)) return stored;
    const old = guildId ? legacyLanguage(guildId) : null;
    if (old && languages.has(old)) return old;
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
    return [...languages.entries()].map(([code, data]) => ({ code, name: data.language?.name || code }));
}

/**
 * Localizations of a key for every language that defines it (for slash command descriptions).
 */
function localizations(key) {
    const out = {};
    for (const [code, data] of languages) {
        const text = lookup(data, key);
        if (typeof text !== 'string' || code === FALLBACK) continue;
        for (const [locale, target] of discordLocaleMap) {
            if (target === code) out[locale] = clean(text).slice(0, 100);
        }
    }
    return out;
}

module.exports = {
    t,
    clean,
    forGuild,
    guildLanguage,
    setGuildLanguage,
    fromDiscordLocale,
    list,
    localizations,
    resetLegacyCache: () => {
        legacy = null;
    },
    legacyLanguage,
    languages,
    FALLBACK,
    get defaultLanguage() {
        return defaultLanguage;
    },
};
