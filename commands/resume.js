module.exports = {
    description: "Restarts paused music.",
    name: 'resume',
    options: [],
    voiceChannel: true,

    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);

        if (!queue) return interaction.reply({ content:`There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })

        const success = queue.setPaused(false);

        return interaction.reply({ content: success ? `**${queue.current.title}**, The song continues to play. ✅` : `Something went wrong. ❌` }).catch(e => { })
    },
};
