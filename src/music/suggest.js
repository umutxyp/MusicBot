'use strict';

const { TTLCache } = require('../core/cache');

const cache = new TTLCache({ ttlMs: 10 * 60_000, maxSize: 2000 });

/**
 * YouTube search suggestions for /play autocomplete. Autocomplete must answer within 3 seconds,
 * so this uses the lightweight suggestion endpoint instead of a full search.
 */
async function suggestions(query, { timeoutMs = 1500 } = {}) {
    const value = String(query || '').trim();
    if (value.length < 2 || /^https?:\/\//i.test(value)) return [];
    const key = value.toLowerCase();

    return cache.wrap(key, async () => {
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(value)}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
        if (!response.ok) return [];
        const body = JSON.parse(Buffer.from(await response.arrayBuffer()).toString('utf8'));
        return Array.isArray(body?.[1]) ? body[1].filter((item) => typeof item === 'string').slice(0, 10) : [];
    }).catch(() => []);
}

/**
 * Autocomplete choices: the typed text first, then suggestions.
 */
async function choices(query) {
    const value = String(query || '').trim();
    // Links and long text are submitted exactly as typed; a choice would truncate them to 100 characters.
    if (!value || value.length > 100 || /^https?:\/\//i.test(value)) return [];
    const items = await suggestions(value);
    const seen = new Set([value.toLowerCase()]);
    const rest = items
        .filter((item) => item.length <= 100 && !seen.has(item.toLowerCase()) && seen.add(item.toLowerCase()))
        .map((item) => ({ name: item, value: item }));
    return [{ name: value, value }, ...rest].slice(0, 25);
}

module.exports = { suggestions, choices };
