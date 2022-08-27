const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
name: "time",
description: "Indicates which minute of the music you are playing.",
permissions: "0x0000000000000800",
options: [],
run: async (client, interaction) => {
    let lang = client.language
const queue = client.player.getQueue(interaction.guild.id);

if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })

const progress = queue.createProgressBar();
const timestamp = queue.getPlayerTimestamp();

if (timestamp.progress == 'Infinity') return interaction.reply({ content: lang.msg84, ephemeral: true }).catch(e => { })

const saveButton = new ButtonBuilder();
saveButton.setLabel(lang.msg86);
saveButton.setCustomId('time');
saveButton.setStyle(ButtonStyle.Success);
const row = new ActionRowBuilder().addComponents(saveButton);

const embed = new EmbedBuilder()
.setColor('007fff')
.setTitle(queue.current.title)
.setThumbnail(client.user.displayAvatarURL())
.setTimestamp()
.setDescription(`${progress} (**${timestamp.progress}**%)`)
.setFooter({ text: `codeshare.me | Umut Bayraktar ❤️` })
interaction.reply({ embeds: [embed], components: [row] }).catch(e => { })
},
};
