'use strict';

/**
 * Format seconds as m:ss or h:mm:ss.
 */
function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Parse "90", "1:30" or "1:02:03" into seconds. Returns null when invalid.
 */
function parseTime(input) {
    const value = String(input ?? '').trim();
    if (!/^\d+(:\d{1,2}){0,2}$/.test(value)) return null;
    const parts = value.split(':').map(Number);
    if (parts.slice(1).some((part) => part >= 60)) return null;
    return parts.reduce((total, part) => total * 60 + part, 0);
}

function progressBar(current, total, size = 16) {
    if (!total || total <= 0) return '─'.repeat(size);
    const ratio = Math.min(1, Math.max(0, current / total));
    const position = Math.min(size - 1, Math.round(ratio * (size - 1)));
    return `${'━'.repeat(position)}●${'─'.repeat(size - position - 1)}`;
}

function truncate(text, max) {
    const value = String(text ?? '');
    if (value.length <= max) return value;
    return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/**
 * Escape characters that would break markdown links / formatting.
 */
function escapeMarkdown(text) {
    return String(text ?? '').replace(/([\\*_`~|>[\]()])/g, '\\$1');
}

function safeUrl(url) {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href.replace(/\)/g, '%29') : null;
    } catch {
        return null;
    }
}

// Emoji (with their joiners, variation selectors, skin tones and keycaps) and flags.
const EMOJI = /[\p{Extended_Pictographic}\p{Regional_Indicator}\u{1F3FB}-\u{1F3FF}\u20E3\uFE0E\uFE0F\u200D]/gu;
// Control, format (zero-width, bidi), separator and private-use characters.
const INVISIBLE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Co}]/gu;
// Url schemes and dots between letters/digits, which Discord reads as a url or domain in a label.
const SCHEME = /[a-z0-9+.-]*:\/\//gi;
const INNER_DOT = /(?<=[\p{L}\p{N}])\.(?=[\p{L}\p{N}])/gu;

/**
 * Turn any title into text Discord accepts as a masked-link label. Discord silently
 * drops the link (and shows the raw "[...](...)") when the label holds emoji, brackets,
 * line breaks, invisible characters, a url, or nothing at all.
 */
function linkLabel(title, max = 80) {
    let label = String(title ?? '')
        .normalize('NFC')
        .replace(EMOJI, ' ')
        .replace(INVISIBLE, ' ')
        .replace(/\[/g, '(')
        .replace(/\]/g, ')')
        .replace(SCHEME, ' ')
        .replace(INNER_DOT, '\u2024')
        .replace(/\s+/g, ' ')
        .trim();
    if (!label || !/[\p{L}\p{N}]/u.test(label)) label = 'Untitled';
    return escapeMarkdown(truncate(label, max));
}

/**
 * "[Title](url)" when the url is valid, plain escaped title otherwise.
 */
function link(title, url, max = 80) {
    const href = safeUrl(url);
    if (!href) return escapeMarkdown(truncate(String(title ?? '').replace(/\s+/g, ' ').trim(), max));
    return `[${linkLabel(title, max)}](${href})`;
}

function chunk(items, size) {
    const out = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
}

module.exports = { formatDuration, parseTime, progressBar, truncate, escapeMarkdown, safeUrl, link, linkLabel, chunk };
