'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'queue',
    data: command('jump', 'Skip to a song in the queue')
        .addIntegerOption((option) => option.setName('position').setDescription('Position in the queue').setRequired(true).setMinValue(1)),

    execute(interaction, ctx) {
        return queueAction(interaction, ctx, (queue, t) => actions.jump(queue, t, interaction.options.getInteger('position', true)));
    },
};
