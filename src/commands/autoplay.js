'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'playback',
    data: command('autoplay', 'Turn autoplay of related songs on or off'),

    execute(interaction, ctx) {
        return queueAction(interaction, ctx, (queue, t) => actions.toggleAutoplay(queue, t));
    },
};
