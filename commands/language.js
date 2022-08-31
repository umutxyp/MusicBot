const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
name: "language",
description: "It allows you to set the language of the bot.",
permissions: "0x0000000000000020",
options: [],
voiceChannel: false,
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);

let buttons = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setLabel("Türkçe")
.setCustomId('tr')
.setStyle(ButtonStyle.Success),
new ButtonBuilder()
.setLabel("English")
.setCustomId('en')
.setStyle(ButtonStyle.Success))

let embed = new EmbedBuilder()
.setColor(client.config.embedColor)
.setTitle("Select a language")
.setTimestamp()
.setFooter({ text: `codeshare.me | Umut Bayraktar ❤️` })
interaction.reply({ embeds: [embed], components: [buttons] }).then(async Message => {

const filter = i => i.user.id === interaction.user.id
let col = await interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

col.on('collect', async (button) => {
if (button.user.id !== interaction.user.id) return
switch (button.customId) {
case 'tr':
await db?.musicbot?.updateOne({ guildID: interaction.guild.id }, { 
$set: { 
language: 'tr' 
} 
}, { upsert: true }).catch(e => { })
await interaction.editReply({ content: `Botun dili başarıyla türkçe oldu.`, embeds:[], components:[], ephemeral: true }).catch(e => { })
await button.deferUpdate();
await col.stop()
break
case 'en':
await db?.musicbot?.updateOne({ guildID: interaction.guild.id }, { 
$set: { 
language: 'en' 
} 
}, { upsert: true }).catch(e => { })
await interaction.editReply({ content: `Bot language successfully changed to english.`, embeds:[], components:[], ephemeral: true }).catch(e => { })
await button.deferUpdate();
await col.stop()
break
}
})

col.on('end', async (button, reason) => {
if (reason === 'time') {
buttons = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setStyle(ButtonStyle.Secondary)
.setLabel(lang.msg45)
.setCustomId("timeend")
.setDisabled(true))

embed = new EmbedBuilder()
.setColor(client.config.embedColor)
.setTitle("Time ended, please try again.")
.setTimestamp()
.setFooter({ text: `codeshare.me | Umut Bayraktar ❤️` })

await interaction.editReply({ embeds: [embed], components: [buttons] })
}
})
}).catch(e => { })
},
}
