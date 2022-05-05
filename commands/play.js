const { QueryType } = require('discord-player');

module.exports = {
    description: "It helps you start a new music.",
    name: 'play',
    options: [{
        name: 'music',
        description: 'Type the name of the music you want to play.',
        type: 'STRING',
        required: true
    }],
    voiceChannel: true,

    run: async (client, interaction) => {
        const music = interaction.options.getString('music')
       if (!music) return interaction.reply({ content: `Write the name of the music you want to search. ❌`, ephemeral: true }).catch(e => { })

        const res = await client.player.search(music, {
            requestedBy: interaction.member,
            searchEngine: QueryType.AUTO
        });

        if (!res || !res.tracks.length) return interaction.reply({ content: `No results found! ❌`, ephemeral: true }).catch(e => { })

        const queue = await client.player.createQueue(interaction.guild, {
                leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
                autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
                metadata: interaction.channel
        });

      await interaction.channel.send({ content: `Your ${res.playlist ? 'Playlist' : 'Track'} Loading... 🎧` });

        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel)
        } catch {
            await client.player.deleteQueue(interaction.guild.id);
            return interaction.reply({ content: `I can't join audio channel. ❌`, ephemeral: true });
        }

        res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);
        if (!queue.playing) await queue.play();
    },
};
