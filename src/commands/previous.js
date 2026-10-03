'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'playback',
    data: command('previous', 'Play the previous song again'),

    execute(interaction, ctx) {
        return queueAction(interaction, ctx, (queue, t) => actions.previous(queue, t));
    },
};
