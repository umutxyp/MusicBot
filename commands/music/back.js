module.exports = {
    name: 'back',
    aliases: [],
    utilisation: '{prefix}back',
    voiceChannel: true,

    async execute(client, message) {
        const queue = client.player.getQueue(message.guild.id);

        if (!queue || !queue.playing) return message.channel.send({ content: `${message.author}, No music currently playing! ❌` });

        if (!queue.previousTracks[1]) return message.channel.send({ content: `${message.author}, There was no music playing before ❌` });

        await queue.back();

        message.channel.send({ content: `Previous music started playing... ✅` });
    },
};
