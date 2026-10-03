'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');
const { parseTime } = require('../core/format');

module.exports = {
    category: 'playback',
    data: command('seek', 'Jump to a time in the current song')
        .addStringOption((option) => option.setName('time').setDescription('For example 1:30 or 90').setRequired(true).setMaxLength(10)),

    execute(interaction, ctx) {
        const seconds = parseTime(interaction.options.getString('time', true));
        return queueAction(interaction, ctx, (queue, t) => actions.seek(queue, t, seconds));
    },
};
