'use strict';

const { command } = require('./_shared');
const actions = require('../music/actions');
const { checkVoice, say } = require('../handlers/guards');

module.exports = {
    category: 'playback',
    data: command('stop', 'Stop the music, clear the queue and leave the voice channel'),

    async execute(interaction, { t, manager }) {
        const check = checkVoice(interaction, manager, t);
        if (check.error) return say(interaction, check.error);
        const outcome = await actions.stop(check.queue, t, manager);
        return say(interaction, outcome.message);
    },
};
