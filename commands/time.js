const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
module.exports = {
    description: "Indicates which minute of the music you are playing.",
    name: 'time',
    options: [],
    voiceChannel: true,
    run: async (client, interaction) => {

        const queue = client.player.getQueue(interaction.guild.id);

        if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })

        const progress = queue.createProgressBar();
        const timestamp = queue.getPlayerTimestamp();

        if (timestamp.progress == 'Infinity') return interaction.reply({ content: `This song is live streaming, no duration data to display. 🎧`, ephemeral: true }).catch(e => { })

        const saveButton = new MessageButton();

        saveButton.setLabel('Update');
        saveButton.setCustomId('time');
        saveButton.setStyle('SUCCESS');

        const row = new MessageActionRow().addComponents(saveButton);

        const embed = new MessageEmbed()
        .setColor('BLUE')
        .setTitle(queue.current.title)
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setDescription(`${progress} (**${timestamp.progress}**%)`)
        .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
        interaction.reply({ embeds: [embed], components: [row]}).catch(e => { })
    },
};
