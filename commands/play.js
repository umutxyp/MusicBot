const { QueryType } = require('discord-player');

module.exports = {
    description: "It helps you start a new music.",
    name: 'play',
    options: [{
        name: 'musics',
        description: 'Type the name of the music you want to play.',
        type: 'STRING',
        required: true
    }],
    voiceChannel: true,

    run: async (client, interaction) => {
        const name = interaction.options.getString('musics')
       if (!name) return interaction.reply({ content: `Write the name of the music you want to search. ❌`, ephemeral: true }).catch(e => { })

        const res = await client.player.search(name, {
            requestedBy: interaction.member,
            searchEngine: QueryType.AUTO
        });

        if (!res || !res.tracks.length) return interaction.reply({ content: `No results found! ❌`, ephemeral: true }).catch(e => { })

        interaction.reply({ content: `Your Music(s) Loading... 🎧` }).catch(e => {})

        const queue = await client.player.createQueue(interaction.guild, {
                leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
                autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
                metadata: interaction.channel
        });
     
        try {
            if (!interaction.guild.me.voice.channelID) await queue.connect(interaction.member.voice.channel)
        } catch {
            await client.player.deleteQueue(interaction.guild.id);
            return interaction.reply({ content: `I can't join audio channel. ❌`, ephemeral: true }).catch(e => { })
        }
       
        res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);
        if (!queue.playing) await queue.play()
   
        
    },
};
