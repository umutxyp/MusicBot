const { JsonDB } = require('node-json-db');
const fs = require('fs');
const path = require('path');

// Initialize JSON database
const db = new JsonDB('database/languages', true, true, '/');

/**
 * Language utility functions for the Discord bot
 */
class LanguageManager {
    constructor() {
        this.languagesPath = path.join(__dirname, '..', 'languages');
        this.defaultLanguage = 'en';
        this.loadedLanguages = new Map();
        this.serverLanguageCache = new Map(); // Cache for server languages

        // Preload language files
        this.loadLanguages();
    }

    /**
     * Load all language files into memory
     */
    loadLanguages() {
        try {
            const languageFiles = fs.readdirSync(this.languagesPath).filter(file => file.endsWith('.json'));

            for (const file of languageFiles) {
                const langCode = file.replace('.json', '');
                const langData = JSON.parse(fs.readFileSync(path.join(this.languagesPath, file), 'utf8'));
                this.loadedLanguages.set(langCode, langData);
            }

            console.log(`✅ Loaded ${this.loadedLanguages.size} language files`);
        } catch (error) {
            console.error('❌ Error loading language files:', error);
        }
    }

    /**
     * Get server language from database with caching
     * @param {string} guildId - Discord guild ID
     * @returns {string} Language code (e.g., 'en', 'tr')
     */
    async getServerLanguage(guildId) {
        // Check cache first
        if (this.serverLanguageCache.has(guildId)) {
            return this.serverLanguageCache.get(guildId);
        }

        try {
            const language = await db.getData(`/servers/${guildId}/language`);
            // Cache the result
            this.serverLanguageCache.set(guildId, language);
            return language;
        } catch (error) {
            // Language not set, cache and return default
            this.serverLanguageCache.set(guildId, this.defaultLanguage);
            return this.defaultLanguage;
        }
    }

    /**
     * Get server language synchronously (for cases where you already have the language)
     * @param {string} guildId - Discord guild ID
     * @returns {string} Language code (e.g., 'en', 'tr')
     */
    getServerLanguageSync(guildId) {
        try {
            return db.getObjectDefault(`/servers/${guildId}/language`, this.defaultLanguage);
        } catch (error) {
            return this.defaultLanguage;
        }
    }

    /**
     * Set server language in database and update cache
     * @param {string} guildId - Discord guild ID
     * @param {string} langCode - Language code to set
     */
    async setServerLanguage(guildId, langCode) {
        try {
            await db.push(`/servers/${guildId}/language`, langCode);
            // Update cache immediately
            this.serverLanguageCache.set(guildId, langCode);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get translation for a specific key
     * @param {string} guildId - Discord guild ID
     * @param {string} key - Translation key (e.g., 'commands.play.description')
     * @param {object} variables - Variables to replace in the translation (optional)
     * @returns {string} Translated text
     */
    async getTranslation(guildId, key, variables = {}) {
        const langCode = await this.getServerLanguage(guildId);
        return this.getTranslationSync(langCode, key, variables);
    }

    /**
     * Get translation synchronously
     * @param {string} langCode - Language code
     * @param {string} key - Translation key (e.g., 'commands.play.description')
     * @param {object} variables - Variables to replace in the translation (optional)
     * @returns {string} Translated text
     */
    getTranslationSync(langCode, key, variables = {}) {
        try {
            const langData = this.loadedLanguages.get(langCode) || this.loadedLanguages.get(this.defaultLanguage);

            if (!langData) {
                return key; // Return key if no language data found
            }

            // Navigate through nested object using dot notation
            const keys = key.split('.');
            let translation = langData;

            for (const k of keys) {
                if (translation[k] === undefined) {
                    // Try fallback to default language
                    const defaultLangData = this.loadedLanguages.get(this.defaultLanguage);
                    if (defaultLangData) {
                        translation = defaultLangData;
                        for (const fallbackKey of keys) {
                            if (translation[fallbackKey] === undefined) {
                                return key; // Return key if not found in fallback
                            }
                            translation = translation[fallbackKey];
                        }
                        break;
                    }
                    return key; // Return key if not found
                }
                translation = translation[k];
            }

            // Replace variables in the translation
            if (typeof translation === 'string' && Object.keys(variables).length > 0) {
                for (const [variable, value] of Object.entries(variables)) {
                    translation = translation.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
                }
            }

            return translation || key;
        } catch (error) {
            return key;
        }
    }

    /**
     * Get all available languages
     * @returns {Array} Array of language objects with code, name, and flag
     */
    getAvailableLanguages() {
        const languages = [];
        for (const [code, data] of this.loadedLanguages) {
            languages.push({
                code: data.language.code,
                name: data.language.name,
                flag: data.language.flag
            });
        }
        return languages;
    }

    /**
     * Check if a language code is supported
     * @param {string} langCode - Language code to check
     * @returns {boolean} True if supported
     */
    isLanguageSupported(langCode) {
        return this.loadedLanguages.has(langCode);
    }

    /**
     * Get language data for a specific language
     * @param {string} langCode - Language code
     * @returns {object|null} Language data object or null if not found
     */
    getLanguageData(langCode) {
        return this.loadedLanguages.get(langCode) || null;
    }

    /**
     * Clear language cache for a specific server
     * @param {string} guildId - Discord guild ID
     */
    clearServerLanguageCache(guildId) {
        this.serverLanguageCache.delete(guildId);
    }

    /**
     * Clear all language cache
     */
    clearAllLanguageCache() {
        this.serverLanguageCache.clear();
    }

    /**
     * Force refresh server language from database
     * @param {string} guildId - Discord guild ID
     * @returns {string} Language code
     */
    async refreshServerLanguage(guildId) {
        // Clear cache first
        this.clearServerLanguageCache(guildId);
        // Get fresh data from database
        return await this.getServerLanguage(guildId);
    }

    /**
     * Reload language files (useful for hot reloading)
     */
    reloadLanguages() {
        this.loadedLanguages.clear();
        this.serverLanguageCache.clear(); // Also clear server cache
        this.loadLanguages();
    }
}

// Create singleton instance
const languageManager = new LanguageManager();

module.exports = languageManager;
