module.exports = {
    name: "stop",
    description: "Plays the previous music again.",
    permissions: "0x0000000000000800",
    options: [],
    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);

        if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })

        queue.destroy();

        interaction.reply({ content: `The music playing on this server has been turned off, see you next time ✅` }).catch(e => { })
    },
};
