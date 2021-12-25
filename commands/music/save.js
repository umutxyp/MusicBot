module.exports = {
    name: 'save',
    aliases: [],
    utilisation: '{prefix}save',
    voiceChannel: true,

    async execute(client, message) {
        const queue = client.player.getQueue(message.guild.id);

  if (!queue || !queue.playing) return message.channel.send(`${message.author}, There is no music currently playing!. ❌`);

        message.author.send(`Registered track: **${queue.current.title}** | ${queue.current.author}, Saved server: **${message.guild.name}** ✅`) .then(() => {
            message.channel.send(`I sent the name of the music via private message. ✅`);
        }).catch(error => {
            message.channel.send(`${message.author}, Unable to send you private message. ❌`);
        });
    },
};