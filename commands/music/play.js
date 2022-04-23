const { QueryType } = require('discord-player');

module.exports = {
    name: 'play',
    aliases: ['p'],
    utilisation: '{prefix}play [song name/URL]',
    voiceChannel: true,

    async execute(client, message, args) {
if (!args[0]) return message.channel.send({ content: `${message.author}, Write the name of the music you want to search. ❌` });

        const res = await client.player.search(args.join(' '), {
            requestedBy: message.member,
            searchEngine: QueryType.AUTO
        });

        if (!res || !res.tracks.length) return message.channel.send({ content: `${message.author}, No results found! ❌` });

        const queue = await client.player.createQueue(message.guild, {
                leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
                autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
            metadata: message.channel
        });

        try {
            if (!queue.connection) await queue.connect(message.member.voice.channel)
        } catch {
            await client.player.deleteQueue(message.guild.id);
            return message.channel.send({ content: `${message.author}, I can't join audio channel. ❌` });
        }

        await message.channel.send({ content: `Your ${res.playlist ? 'Playlist' : 'Track'} Loading... 🎧` });

        res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);

        if (!queue.playing) await queue.play();
    },
};
