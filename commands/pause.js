module.exports = {
    description: "Stops playing the currently playing music.",
    name: 'pause',
    options: [],
    voiceChannel: true,

    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);

       if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })

        const success = queue.setPaused(true);

        return interaction.reply({ content: success ? `The currently playing music named **${queue.current.title}** has stopped ✅` : `Something went wrong. ❌` }).catch(e => { })
    },
};
