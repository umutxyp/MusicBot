module.exports = {
    description: "Switches the music being played.",
    name: 'skip',
    options: [],
    voiceChannel: true,

    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);
 
        if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })

        const success = queue.skip();

        return interaction.reply({ content: success ? `**${queue.current.title}**, Skipped song ✅` : `Something went wrong ❌` }).catch(e => { })
    },
};
