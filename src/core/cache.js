'use strict';

/**
 * Small TTL cache that also de-duplicates concurrent loads of the same key.
 */
class TTLCache {
    constructor({ ttlMs, maxSize = 1000 } = {}) {
        this.ttlMs = ttlMs;
        this.maxSize = maxSize;
        this.entries = new Map();
        this.pending = new Map();
    }

    get(key) {
        const entry = this.entries.get(key);
        if (!entry) return undefined;
        if (entry.expires <= Date.now()) {
            this.entries.delete(key);
            return undefined;
        }
        return entry.value;
    }

    has(key) {
        return this.get(key) !== undefined;
    }

    set(key, value, ttlMs = this.ttlMs) {
        if (value === undefined) return;
        this.entries.delete(key);
        this.entries.set(key, { value, expires: Date.now() + ttlMs });
        while (this.entries.size > this.maxSize) {
            this.entries.delete(this.entries.keys().next().value);
        }
    }

    delete(key) {
        this.entries.delete(key);
    }

    clear() {
        this.entries.clear();
        this.pending.clear();
    }

    /**
     * Return the cached value or run loader once, sharing the promise between concurrent callers.
     */
    async wrap(key, loader, ttlMs = this.ttlMs) {
        const cached = this.get(key);
        if (cached !== undefined) return cached;
        if (this.pending.has(key)) return this.pending.get(key);

        const promise = (async () => {
            try {
                const value = await loader();
                this.set(key, value, ttlMs);
                return value;
            } finally {
                this.pending.delete(key);
            }
        })();
        this.pending.set(key, promise);
        return promise;
    }
}

/**
 * Concurrency limiter with a high-priority lane (user actions) and a low-priority lane (prefetch).
 */
class Semaphore {
    constructor(limit) {
        this.limit = Math.max(1, limit);
        this.active = 0;
        this.high = [];
        this.low = [];
    }

    async run(task, { priority = 'high' } = {}) {
        if (this.active >= this.limit) {
            await new Promise((resolve) => (priority === 'low' ? this.low : this.high).push(resolve));
        } else {
            this.active++;
        }
        try {
            return await task();
        } finally {
            const next = this.high.shift() || this.low.shift();
            if (next) next();
            else this.active--;
        }
    }
}

module.exports = { TTLCache, Semaphore };
