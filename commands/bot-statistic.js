const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Colors } = require("discord.js")
const config = require("../config.js");
module.exports = {
name: "statistic",
description: "View your bot statistics.",
options: [],
run: async (client, interaction) => {
    let lang = client.language
let link_button = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setLabel(lang.msg20)
.setStyle(ButtonStyle.Success)
.setCustomId("Refresh"))


const embed = new EmbedBuilder()
.setTitle(client.user.username + lang.msg19)
.setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
.setDescription(`**
• Owner: \`${client.users.cache.get(config.ownerID)?.tag || "Undefined"}\`
• Developer: \`Umut#6070\`

• User Count: \`${client.users.cache.size}\`
• Server Count: \`${client.guilds.cache.size}\`
• Channel Count: \`${client.channels.cache.size}\`
• Command Count: \`${client.commands.map(c => c.name).length}\`
• Discord.js Version: \`V14.1.0\`
• Node.js Version: \`${process.version}\`
• Operation Time: <t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>
• Ping: \`${client.ws.ping} MS\`
• Memory Usage: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`
• OS: \`${process.platform}\`
• Invite Bot: [Click](${config.botInvite})
**`)
.setColor(Colors.Green)
.setTimestamp()
return interaction.reply({ embeds: [embed], components: [link_button] }).then(async Message => {

const filter = i => i.user.id === interaction.user.id
let col = await interaction.channel.createMessageComponentCollector({ filter, time: 120000 })

col.on('collect', async (button) => {
switch (button.customId) {
case 'Refresh': {
const embed2 = new EmbedBuilder()
.setTitle(client.user.username + lang.msg19)
.setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
.setDescription(`**
• Owner: \`${client.users.cache.get(config.ownerID)?.tag || "Bulunamadı!"}\`
• Developer: \`Umut#6070\`

• User Count: \`${client.users.cache.size}\`
• Server Count: \`${client.guilds.cache.size}\`
• Channel Count: \`${client.channels.cache.size}\`
• Command Count: \`${client.commands.map(c => c.name).length}\`
• Discord.js Version: \`V14.1.0\`
• Node.js Version: \`${process.version}\`
• Operation Time: <t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>
• Ping: \`${client.ws.ping} MS\`
• Memory Usage: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`
• OS: \`${process.platform}\`
• Invite Bot: [Click](${config.botInvite})
**`)
.setColor(Colors.Green)
.setTimestamp()
await interaction.editReply({ content: lang.msg22, embeds: [embed2] }).catch(err => { })
await button.deferUpdate().catch(e => { })
}
}
})
col.on('end', async (button) => {
link_button = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setLabel(lang.msg20)
.setStyle(ButtonStyle.Success)
.setCustomId("Refresh")
.setDisabled(true))
return interaction.editReply({ content: lang.msg21, components: [link_button] }).catch(err => { })
})
}).catch(err => { })
},
};
