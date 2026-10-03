'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'playback',
    data: command('skip', 'Skip the current song'),

    execute(interaction, ctx) {
        return queueAction(interaction, ctx, (queue, t) => actions.skip(queue, t));
    },
};
