'use strict';

const { command } = require('./_shared');
const { say } = require('../handlers/guards');
const views = require('../ui/views');

module.exports = {
    category: 'queue',
    data: command('queue', 'Show the songs in the queue')
        .addIntegerOption((option) => option.setName('page').setDescription('Page number').setMinValue(1)),

    async execute(interaction, { t, manager }) {
        const queue = manager.getQueue(interaction.guildId);
        if (!queue?.songs.length) return say(interaction, t('commands.nowplaying.no_track'));
        const page = (interaction.options.getInteger('page') ?? 1) - 1;
        return interaction.reply(views.queueView(t, { current: queue.songs[0], upcoming: queue.songs.slice(1), page }));
    },
};
