'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'playback',
    data: command('pause', 'Pause the music'),

    execute(interaction, ctx) {
        return queueAction(interaction, ctx, (queue, t) => actions.pause(queue, t));
    },
};
