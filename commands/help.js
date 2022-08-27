const { EmbedBuilder } = require('discord.js')
module.exports = {
name: "help",
description: "It helps you to get information about bot and commands.",
permissions: "0x0000000000000800",
options: [],
showHelp: false,
run: async (client, interaction) => {
    let lang = client.language
const commands = client.commands.filter(x => x.showHelp !== false);

const embed = new EmbedBuilder()
.setColor('007fff')
.setTitle(client.user.username)
.setThumbnail(client.user.displayAvatarURL())
.setDescription(lang.msg32)
.addFields([
{ name: `${lang.msg33}`, value: commands.map(x => `\`/${x.name}\``).join(' | ') }
])
.setTimestamp()
.setFooter({ text: `codeshare.me | Umut Bayraktar ❤️` })
interaction.reply({ embeds: [embed] }).catch(e => { })
},
};
