'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');
const views = require('../ui/views');

module.exports = {
    category: 'playback',
    data: command('filter', 'Apply an audio filter')
        .addStringOption((option) => option
            .setName('name')
            .setDescription('Filter')
            .setRequired(true)
            .addChoices({ name: 'None', value: 'none' }, ...views.FILTERS.map((name) => ({ name: views.FILTER_LABELS[name], value: name })))),

    execute(interaction, ctx) {
        return queueAction(interaction, ctx, (queue, t) => actions.setFilter(queue, t, interaction.options.getString('name', true)));
    },
};
