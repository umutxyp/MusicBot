module.exports = {
    description: "Clears the music queue.",
    name: 'clear',
    options: [],
    voiceChannel: true,

    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);

        if (!queue || !queue.playing) return interaction.reply({ content: `No music currently playing. ❌`, ephemeral: true }).catch(e => { })

        if (!queue.tracks[0]) return interaction.reply({ content: `There is already no music in queue after the current one ❌`, ephemeral: true }).catch(e => { })

        await queue.clear();

        interaction.reply({ content: `The queue has just been cleared. 🗑️` }).catch(e => { })
    },
};
