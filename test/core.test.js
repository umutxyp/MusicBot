'use strict';

require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { formatDuration, parseTime, progressBar, truncate, escapeMarkdown, link, safeUrl } = require('../src/core/format');
const { TTLCache, Semaphore } = require('../src/core/cache');
const { JsonStore } = require('../src/core/store');
const { parseColor } = require('../src/config');

test('formatDuration', () => {
    assert.equal(formatDuration(0), '0:00');
    assert.equal(formatDuration(65), '1:05');
    assert.equal(formatDuration(3661), '1:01:01');
    assert.equal(formatDuration(-5), '0:00');
    assert.equal(formatDuration('abc'), '0:00');
});

test('parseTime accepts s, m:ss and h:mm:ss only', () => {
    assert.equal(parseTime('90'), 90);
    assert.equal(parseTime('1:30'), 90);
    assert.equal(parseTime('1:02:03'), 3723);
    assert.equal(parseTime('1:60'), null);
    assert.equal(parseTime('abc'), null);
    assert.equal(parseTime(''), null);
    assert.equal(parseTime('-5'), null);
});

test('progressBar always has a fixed width and one marker', () => {
    for (const [cur, total] of [[0, 100], [50, 100], [100, 100], [150, 100], [10, 0]]) {
        const bar = progressBar(cur, total, 12);
        assert.equal([...bar].length, 12);
        assert.ok((bar.match(/●/g) || []).length <= 1);
    }
});

test('truncate / escapeMarkdown / link / safeUrl', () => {
    assert.equal(truncate('abcdef', 4), 'abc…');
    assert.equal(truncate('abc', 4), 'abc');
    assert.equal(escapeMarkdown('a*b_[c](d)'), 'a\\*b\\_\\[c\\]\\(d\\)');
    assert.equal(link('Title', 'https://x.y/a)b'), '[Title](https://x.y/a%29b)');
    assert.equal(link('Title', 'javascript:alert(1)'), 'Title');
    assert.equal(safeUrl('ftp://x'), null);
});

test('parseColor falls back for invalid values', () => {
    assert.equal(parseColor('#ff0000'), 0xff0000);
    assert.equal(parseColor('nope'), 0x5865f2);
});

test('TTLCache expires entries and deduplicates concurrent loads', async () => {
    const cache = new TTLCache({ ttlMs: 30 });
    let calls = 0;
    const loader = async () => {
        calls++;
        await new Promise((r) => setTimeout(r, 10));
        return 'value';
    };
    const [a, b] = await Promise.all([cache.wrap('k', loader), cache.wrap('k', loader)]);
    assert.equal(a, 'value');
    assert.equal(b, 'value');
    assert.equal(calls, 1);
    await new Promise((r) => setTimeout(r, 40));
    assert.equal(cache.get('k'), undefined);
    await assert.rejects(cache.wrap('err', async () => { throw new Error('x'); }));
    assert.equal(cache.pending.size, 0);
});

test('TTLCache evicts oldest entries beyond maxSize', () => {
    const cache = new TTLCache({ ttlMs: 1000, maxSize: 2 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    assert.equal(cache.get('a'), undefined);
    assert.equal(cache.get('c'), 3);
});

test('Semaphore limits concurrency and prefers high priority', async () => {
    const sem = new Semaphore(1);
    const order = [];
    let release;
    const first = sem.run(() => new Promise((r) => { release = r; }));
    const low = sem.run(async () => order.push('low'), { priority: 'low' });
    const high = sem.run(async () => order.push('high'));
    release();
    await Promise.all([first, low, high]);
    assert.deepEqual(order, ['high', 'low']);
    assert.equal(sem.active, 0);
});

test('JsonStore writes atomically, caches and deletes', async () => {
    const dir = path.join(process.env.DATA_DIR, 'store-test');
    const store = new JsonStore(dir);
    await store.set('123', { a: 1 });
    await store.set('123', { a: 2 });
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, '123.json'), 'utf8')), { a: 2 });
    assert.deepEqual(new JsonStore(dir).get('123'), { a: 2 });
    assert.deepEqual(store.keys(), ['123']);
    await store.delete('123');
    assert.equal(fs.existsSync(path.join(dir, '123.json')), false);
    assert.throws(() => store.file('../evil'));
    assert.equal(fs.readdirSync(dir).filter((f) => f.endsWith('.tmp')).length, 0);
});
