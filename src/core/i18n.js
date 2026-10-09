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
 * Language for a guild: saved setting (data/guilds/<id>.json) > guild's Discord locale > default.
 */
function guildLanguage(guildId, guildLocale) {
    return savedLanguage(guildId) || fromDiscordLocale(guildLocale) || defaultLanguage;
}

/**
 * Language chosen with /language for a guild, or null when none is saved.
 */
function savedLanguage(guildId) {
    const stored = guildId ? getSettings().get(guildId)?.language : null;
    return stored && languages.has(stored) ? stored : null;
}

async function setGuildLanguage(guildId, code) {
    if (!languages.has(code)) throw new Error(`Unknown language: ${code}`);
    const store = getSettings();
    await store.set(guildId, { ...(store.get(guildId) || {}), language: code });
}

function translator(lang) {
    const translate = (key, vars) => t(lang, key, vars);
    translate.lang = lang;
    return translate;
}

/**
 * Translator bound to a guild. Used for messages everyone sees (the player panel, announcements).
 */
function forGuild(guild) {
    return translator(guildLanguage(guild?.id, guild?.preferredLocale));
}

/**
 * Translator for replying to one user: the guild language when one is saved with /language,
 * otherwise the user's Discord language when the bot has it, otherwise the default (English).
 */
function forInteraction(interaction) {
    return translator(savedLanguage(interaction?.guild?.id) || fromDiscordLocale(interaction?.locale) || defaultLanguage);
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
    forInteraction,
    guildLanguage,
    savedLanguage,
    setGuildLanguage,
    fromDiscordLocale,
    list,
    localizations,
    languages,
    FALLBACK,
    get defaultLanguage() {
        return defaultLanguage;
    },
};
