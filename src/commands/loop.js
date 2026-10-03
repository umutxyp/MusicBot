'use strict';

const { RepeatMode } = require('distube');
const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'playback',
    data: command('loop', 'Repeat the current song or the whole queue')
        .addStringOption((option) => option
            .setName('mode')
            .setDescription('Loop mode')
            .setRequired(true)
            .addChoices(
                { name: 'Off', value: 'off' },
                { name: 'Song', value: 'song' },
                { name: 'Queue', value: 'queue' },
            )),

    execute(interaction, ctx) {
        const mode = { off: RepeatMode.DISABLED, song: RepeatMode.SONG, queue: RepeatMode.QUEUE }[interaction.options.getString('mode', true)];
        return queueAction(interaction, ctx, (queue, t) => actions.setLoop(queue, t, mode));
    },
};
