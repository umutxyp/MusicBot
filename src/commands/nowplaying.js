'use strict';

const { command } = require('./_shared');
const { say } = require('../handlers/guards');

module.exports = {
    category: 'playback',
    data: command('nowplaying', 'Show the player panel again at the bottom of the chat'),

    async execute(interaction, { t, manager }) {
        const queue = manager.getQueue(interaction.guildId);
        if (!queue?.songs.length) return say(interaction, t('commands.nowplaying.no_track'));
        const response = await interaction.reply({ ...manager.panelPayload(queue), withResponse: true });
        const message = response.resource?.message;
        if (message) manager.replacePanel(queue.id, message);
        return message;
    },
};
