'use strict';

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);

const colors = {
    debug: paint('90'),
    info: paint('36'),
    ok: paint('32'),
    warn: paint('33'),
    error: paint('31'),
};

const shardTag = () => {
    const id = process.env.SHARDS;
    return id !== undefined ? `[shard ${id}]` : '';
};

let debugEnabled = false;

function write(level, scope, args) {
    if (level === 'debug' && !debugEnabled) return;
    const time = new Date().toISOString().slice(11, 19);
    const prefix = [time, colors[level](level.toUpperCase().padEnd(5)), shardTag(), scope ? `[${scope}]` : '']
        .filter(Boolean)
        .join(' ');
    const out = level === 'error' || level === 'warn' ? console.error : console.log;
    out(prefix, ...args);
}

function createLogger(scope) {
    return {
        debug: (...args) => write('debug', scope, args),
        info: (...args) => write('info', scope, args),
        ok: (...args) => write('ok', scope, args),
        warn: (...args) => write('warn', scope, args),
        error: (...args) => write('error', scope, args),
        child: (sub) => createLogger(scope ? `${scope}:${sub}` : sub),
    };
}

module.exports = createLogger('');
module.exports.createLogger = createLogger;
module.exports.setDebug = (value) => {
    debugEnabled = Boolean(value);
};
