'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'queue',
    data: command('remove', 'Remove a song from the queue')
        .addIntegerOption((option) => option.setName('position').setDescription('Position in the queue').setRequired(true).setMinValue(1)),

    execute(interaction, ctx) {
        return queueAction(interaction, ctx, (queue, t) => actions.remove(queue, t, interaction.options.getInteger('position', true)));
    },
};
