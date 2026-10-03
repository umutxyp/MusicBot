'use strict';

const config = require('../config');
const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'playback',
    data: command('volume', 'Change the volume')
        .addIntegerOption((option) => option
            .setName('level')
            .setDescription(`Volume from 0 to ${config.bot.maxVolume}`)
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(config.bot.maxVolume)),

    execute(interaction, ctx) {
        return queueAction(interaction, ctx, (queue, t) => actions.setVolume(queue, t, interaction.options.getInteger('level', true)));
    },
};
