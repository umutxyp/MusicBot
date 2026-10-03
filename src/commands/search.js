'use strict';

const { randomBytes } = require('node:crypto');
const { command } = require('./_shared');
const { checkVoice, say, respond } = require('../handlers/guards');
const { TTLCache } = require('../core/cache');
const views = require('../ui/views');

const RESULTS = 10;
// token -> { userId, results }
const searches = new TTLCache({ ttlMs: 10 * 60_000, maxSize: 500 });

module.exports = {
    category: 'playback',
    searches,
    data: command('search', 'Search YouTube and pick a song from the results')
        .addStringOption((option) => option.setName('query').setDescription('What to search for').setRequired(true).setMaxLength(200)),

    async execute(interaction, ctx) {
        const { t, manager } = ctx;
        const check = checkVoice(interaction, manager, t, { requireQueue: false, join: true });
        if (check.error) return say(interaction, check.error);

        await interaction.deferReply({ flags: 'Ephemeral' });
        const query = interaction.options.getString('query', true).trim();
        let results;
        try {
            results = await manager.youtube.search(query, RESULTS, interaction.guildId);
        } catch (error) {
            return say(interaction, t(manager.explainError(error)));
        }
        if (!results.length) return say(interaction, t('commands.search.no_results'));

        const token = randomBytes(6).toString('hex');
        searches.set(token, { userId: interaction.user.id, results });
        return respond(interaction, views.searchView(t, { query, results, token }));
    },
};
