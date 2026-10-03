'use strict';

const { command } = require('./_shared');
const i18n = require('../core/i18n');
const views = require('../ui/views');

const CATEGORY_ORDER = ['playback', 'queue', 'settings'];

function formatUptime(ms) {
    const minutes = Math.floor(ms / 60_000);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return [days ? `${days}d` : null, hours ? `${hours}h` : null, `${minutes % 60}m`].filter(Boolean).join(' ');
}

async function collectStats(client) {
    const local = { servers: client.guilds.cache.size, active: client.music?.distube.queues.collection.size ?? 0 };
    if (!client.shard) return local;
    try {
        const results = await client.shard.broadcastEval((c) => ({
            servers: c.guilds.cache.size,
            active: c.music?.distube.queues.collection.size ?? 0,
        }));
        return results.reduce((sum, item) => ({ servers: sum.servers + item.servers, active: sum.active + item.active }), { servers: 0, active: 0 });
    } catch {
        return local;
    }
}

module.exports = {
    category: 'settings',
    data: command('help', 'Show commands and bot information'),

    async execute(interaction, { t, client }) {
        const commands = [...client.commands.values()]
            .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.data.name.localeCompare(b.data.name))
            .map((cmd) => {
                const key = `commands.${cmd.data.name}.description`;
                const localized = i18n.t(t.lang, key);
                return { name: cmd.data.name, id: client.commandIds?.get(cmd.data.name), description: localized === key ? cmd.data.description : localized };
            });
        const stats = await collectStats(client);
        return interaction.reply(views.helpView(t, {
            commands,
            stats: { ...stats, uptime: formatUptime(client.uptime || 0), ping: Math.max(0, Math.round(client.ws.ping)) },
        }));
    },
};
