'use strict';

const { command, queueAction } = require('./_shared');
const actions = require('../music/actions');

module.exports = {
    category: 'queue',
    data: command('shuffle', 'Shuffle the queue'),

    execute(interaction, ctx) {
        return queueAction(interaction, ctx, (queue, t) => actions.shuffle(queue, t));
    },
};
