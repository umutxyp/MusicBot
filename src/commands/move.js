'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'queue',
    data: command('move', 'Move a song to another position in the queue')
        .addIntegerOption((option) => option.setName('from').setDescription('Current position').setRequired(true).setMinValue(1))
        .addIntegerOption((option) => option.setName('to').setDescription('New position').setRequired(true).setMinValue(1)),

    execute(interaction, ctx) {
        const from = interaction.options.getInteger('from', true);
        const to = interaction.options.getInteger('to', true);
        return queueAction(interaction, ctx, (queue, t) => actions.move(queue, t, from, to));
    },
};
