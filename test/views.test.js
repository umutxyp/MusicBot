'use strict';

const { makeSong, fakeMember, t } = require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const { MessageFlags, ComponentType } = require('discord.js');
const i18n = require('../src/core/i18n');
const views = require('../src/ui/views');

/**
 * Serialize (runs discord.js validation) and check Discord's Components V2 limits.
 */
function validate(payload) {
    assert.ok(payload.flags & MessageFlags.IsComponentsV2);
    const json = payload.components.map((component) => component.toJSON());
    let count = 0;
    let textLength = 0;
    const customIds = [];
    const walk = (node) => {
        count++;
        if (node.type === ComponentType.TextDisplay) textLength += node.content.length;
        if (node.custom_id) {
            assert.ok(node.custom_id.length <= 100);
            customIds.push(node.custom_id);
        }
        if (node.type === ComponentType.Button && node.label) assert.ok(node.label.length <= 80, node.label);
        if (node.type === ComponentType.ActionRow) assert.ok(node.components.length <= 5);
        if (node.type === ComponentType.StringSelect) {
            assert.ok(node.options.length >= 1 && node.options.length <= 25);
            for (const option of node.options) {
                assert.ok(option.label.length <= 100);
                assert.ok(!option.description || option.description.length <= 100);
            }
            assert.ok(!node.placeholder || node.placeholder.length <= 150);
        }
        for (const child of node.components || []) walk(child);
        if (node.accessory) walk(node.accessory);
    };
    json.forEach(walk);
    assert.ok(count <= 40, `too many components: ${count}`);
    assert.ok(textLength <= 4000, `too much text: ${textLength}`);
    assert.equal(new Set(customIds).size, customIds.length, 'custom ids must be unique');
    return { json, count, textLength, customIds };
}

const baseState = (overrides = {}) => {
    const songs = Array.from({ length: 30 }, (_, i) => makeSong(i + 1));
    songs[0].member = undefined;
    return { song: songs[0], paused: false, currentTime: 42, volume: 80, repeatMode: 0, autoplay: false, filter: null, upcoming: songs.slice(1), upcomingDuration: 5000, ...overrides };
};

test('player panel renders valid V2 components in every state, in every language', () => {
    const long = makeSong(99, { name: 'x'.repeat(500), uploader: { name: 'y'.repeat(300) } });
    const live = makeSong(98, { isLive: true });
    const noThumb = makeSong(97, { thumbnail: undefined });
    const states = [
        baseState(),
        baseState({ paused: true, repeatMode: 1, autoplay: true, filter: 'nightcore' }),
        baseState({ repeatMode: 2, filter: '3d', upcoming: [] }),
        baseState({ song: long }),
        baseState({ song: live }),
        baseState({ song: noThumb, upcoming: [makeSong(2)] }),
    ];
    for (const { code } of i18n.list()) {
        const tr = (key, vars) => i18n.t(code, key, vars);
        for (const state of states) validate(views.playerPanel(tr, state));
    }
});

test('panel shows pause/resume, loop and autoplay state on the buttons', () => {
    const tr = (key, vars) => i18n.t('en', key, vars);
    const find = (json, id) => {
        let found;
        const walk = (node) => {
            if (node.custom_id === id) found = node;
            (node.components || []).forEach(walk);
        };
        json.forEach(walk);
        return found;
    };
    const playing = validate(views.playerPanel(tr, baseState())).json;
    assert.equal(find(playing, views.ID.pause).label, 'Pause');
    assert.equal(find(playing, views.ID.loop).label, 'Loop: Off');
    const paused = validate(views.playerPanel(tr, baseState({ paused: true, repeatMode: 2, autoplay: true }))).json;
    assert.equal(find(paused, views.ID.pause).label, 'Resume');
    assert.equal(find(paused, views.ID.loop).label, 'Loop: Queue');
    assert.equal(find(paused, views.ID.autoplay).label, 'Autoplay: On');
    const single = validate(views.playerPanel(tr, baseState({ upcoming: [makeSong(2)] }))).json;
    assert.equal(find(single, views.ID.shuffle).disabled, true);
});

test('buttons carry no emoji', () => {
    const tr = (key, vars) => i18n.t('en', key, vars);
    const { json } = validate(views.playerPanel(tr, baseState()));
    const text = JSON.stringify(json);
    assert.equal(/"emoji"/.test(text), false);
    assert.equal(/\p{Extended_Pictographic}/u.test(text), false);
});

test('requester line: user mention, autoplay label, or nothing', () => {
    const tr = (key, vars) => i18n.t('en', key, vars);
    const song = makeSong(1);
    song.member = fakeMember();
    const withUser = JSON.stringify(validate(views.playerPanel(tr, baseState({ song }))).json);
    assert.match(withUser, /<@222222222222222222>/);
    const auto = makeSong(2);
    auto.member = fakeMember('333333333333333333', true);
    const autoJson = JSON.stringify(validate(views.playerPanel(tr, baseState({ song: auto }))).json);
    assert.match(autoJson, /Added by autoplay/);
});

test('queue view paginates and clamps the page', () => {
    const songs = Array.from({ length: 45 }, (_, i) => makeSong(i));
    for (const page of [-3, 0, 2, 4, 99]) validate(views.queueView(t, { current: songs[0], upcoming: songs.slice(1), page }));
    const last = validate(views.queueView(t, { current: songs[0], upcoming: songs.slice(1), page: 99 }));
    assert.ok(last.customIds.includes('q:3') && last.customIds.includes('q:5'));
    const empty = validate(views.queueView(t, { current: songs[0], upcoming: [] }));
    assert.equal(empty.customIds.length, 0);
});

test('lyrics view splits long lyrics into valid pages', () => {
    const lyrics = Array.from({ length: 200 }, (_, i) => `Line ${i} [chorus] *x*`).join('\n') + '\n\n' + 'z'.repeat(7000);
    const pages = views.splitLyrics(lyrics);
    assert.ok(pages.length > 2);
    pages.forEach((page) => assert.ok(page.length <= 2800));
    for (let page = 0; page < pages.length; page++) {
        validate(views.lyricsView(t, { title: 'T', artist: 'A', lyrics, source: 'LRCLIB', token: 'abc', page }));
    }
    validate(views.lyricsView(t, { title: 'T', lyrics: 'short', page: 0 }));
});

test('search, help, language, notice and ended views are valid', () => {
    const results = Array.from({ length: 10 }, (_, i) => makeSong(i, { name: 'n'.repeat(300) }));
    validate(views.searchView(t, { query: 'q'.repeat(300), results, token: 'deadbeef' }));
    const commands = Array.from({ length: 22 }, (_, i) => ({ name: `cmd${i}`, id: '123456789012345678', description: 'd'.repeat(100) }));
    validate(views.helpView(t, { commands, stats: { servers: 1, active: 0, uptime: '1m', ping: 50 } }));
    validate(views.languageView(t, { languages: i18n.list(), current: 'tr' }));
    validate(views.notice('x'.repeat(5000)));
    assert.ok(views.notice('x').flags & MessageFlags.Ephemeral);
    assert.ok(!(views.notice('x', { ephemeral: false }).flags & MessageFlags.Ephemeral));
    validate(views.endedPanel(t, { title: 'Done', description: 'desc', song: makeSong(1) }));
});
