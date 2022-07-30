module.exports = {
    name: "pause",
    description: "Stops playing the currently playing music.",
    permissions: "0x0000000000000800",
    options: [],
    run: async (client, interaction) => {

        const queue = client.player.getQueue(interaction.guild.id);

        if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })

        const success = queue.setPaused(true);

        return interaction.reply({ content: success ? `The currently playing music named **${queue.current.title}** has stopped ✅` : `Something went wrong. ❌` }).catch(e => { })
    },
}
