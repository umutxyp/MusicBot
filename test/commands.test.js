'use strict';

require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const { Locale, InteractionContextType } = require('discord.js');
const { loadCommands } = require('../src/commands');
const { commandBodies } = require('../src/deploy');

const locales = new Set(Object.values(Locale));

test('all commands serialize and respect Discord limits', () => {
    const bodies = commandBodies();
    assert.equal(bodies.length, 22);
    const names = new Set();
    for (const body of bodies) {
        assert.match(body.name, /^[a-z0-9_-]{1,32}$/);
        assert.ok(!names.has(body.name));
        names.add(body.name);
        assert.ok(body.description.length >= 1 && body.description.length <= 100, body.name);
        assert.deepEqual(body.contexts, [InteractionContextType.Guild]);
        for (const [locale, text] of Object.entries(body.description_localizations || {})) {
            assert.ok(locales.has(locale), `${body.name}: bad locale ${locale}`);
            assert.ok(text.length <= 100);
        }
        for (const option of body.options || []) {
            assert.ok(option.description.length <= 100);
            for (const [locale] of Object.entries(option.description_localizations || {})) assert.ok(locales.has(locale));
        }
    }
    assert.ok(JSON.stringify(bodies).length < 8000 * bodies.length);
});

test('every command has a category and execute handler; play has autocomplete', () => {
    for (const command of loadCommands().values()) {
        assert.ok(['playback', 'queue', 'settings'].includes(command.category), command.data.name);
        assert.equal(typeof command.execute, 'function');
    }
    assert.equal(typeof loadCommands().get('play').autocomplete, 'function');
});

test('language command requires Manage Server by default', () => {
    const body = commandBodies().find((b) => b.name === 'language');
    assert.equal(body.default_member_permissions, String(1n << 5n));
});
