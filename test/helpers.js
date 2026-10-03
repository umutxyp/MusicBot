'use strict';

const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

// Isolated data dir for every test process.
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'musicbot-test-'));

const { Song } = require('distube');

const ids = { guild: '111111111111111111', user: '222222222222222222', bot: '333333333333333333', voice: '444444444444444444', text: '555555555555555555' };

function fakeMember(id = ids.user, bot = false) {
    return { id, user: { id, bot }, guild: { id: ids.guild } };
}

function makeSong(n, extra = {}) {
    const plugin = extra.plugin || { type: 'extractor' };
    return new Song({
        plugin,
        source: 'youtube',
        playFromSource: true,
        id: `vid${String(n).padStart(8, '0')}`,
        name: `Song ${n}`,
        url: `https://www.youtube.com/watch?v=vid${String(n).padStart(8, '0')}`,
        duration: 180 + n,
        thumbnail: `https://i.ytimg.com/vi/vid${n}/hqdefault.jpg`,
        uploader: { name: `Artist ${n}` },
        ...extra,
    }, { metadata: { requesterId: ids.user } });
}

const t = (key, vars = {}) => `${key}${Object.keys(vars).length ? JSON.stringify(vars) : ''}`;
t.lang = 'en';

module.exports = { ids, fakeMember, makeSong, t };
