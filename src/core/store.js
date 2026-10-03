'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const log = require('./logger').createLogger('store');

const SAFE_KEY = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * One JSON file per key (guild id). Each guild only lives on one shard, so shards never
 * write the same file and no cross-process locking is needed. Writes are atomic (tmp + rename).
 */
class JsonStore {
    constructor(dir) {
        this.dir = dir;
        this.cache = new Map();
        this.writing = new Map();
        fs.mkdirSync(dir, { recursive: true });
    }

    file(key) {
        if (!SAFE_KEY.test(String(key))) throw new Error(`Invalid store key: ${key}`);
        return path.join(this.dir, `${key}.json`);
    }

    get(key) {
        if (this.cache.has(key)) return this.cache.get(key);
        let value = null;
        try {
            value = JSON.parse(fs.readFileSync(this.file(key), 'utf8'));
        } catch (error) {
            if (error.code !== 'ENOENT') log.warn(`Could not read ${key}:`, error.message);
        }
        this.cache.set(key, value);
        return value;
    }

    async set(key, value) {
        this.cache.set(key, value);
        return this.flush(key);
    }

    async delete(key) {
        this.cache.set(key, null);
        return this.flush(key);
    }

    keys() {
        try {
            return fs.readdirSync(this.dir)
                .filter((name) => name.endsWith('.json'))
                .map((name) => name.slice(0, -5))
                .filter((key) => SAFE_KEY.test(key));
        } catch {
            return [];
        }
    }

    /**
     * Serialize writes per key so a slow write never overwrites a newer one.
     */
    flush(key) {
        const previous = this.writing.get(key) || Promise.resolve();
        const next = previous.then(() => this.#write(key)).catch((error) => {
            log.error(`Could not write ${key}:`, error.message);
        });
        this.writing.set(key, next);
        next.finally(() => {
            if (this.writing.get(key) === next) this.writing.delete(key);
        });
        return next;
    }

    async #write(key) {
        const file = this.file(key);
        const value = this.cache.get(key);
        if (value === null || value === undefined) {
            await fsp.rm(file, { force: true });
            return;
        }
        const tmp = `${file}.${process.pid}.tmp`;
        await fsp.writeFile(tmp, JSON.stringify(value), 'utf8');
        await fsp.rename(tmp, file);
    }

    async drain() {
        await Promise.all([...this.writing.values()]);
    }
}

module.exports = { JsonStore };
