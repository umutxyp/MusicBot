const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../mongoDB');
module.exports = {
name: "playlist",
description: "Lets you manage playlist commands.",
options: [
{
name: "create",
description: "Create a playlist.",
type: ApplicationCommandOptionType.Subcommand,
options: [
{
name: "name",
description: "TWrite the name of the playlist you want to create.",
type: ApplicationCommandOptionType.String,
required: true
},
{
name: "public",
description: "Make the playlist public. (true=public playlist, false=private playlist)",
type: ApplicationCommandOptionType.Boolean,
required: true
}
]
},
{
name: "delete",
description: "Delete a playlist.",
type: ApplicationCommandOptionType.Subcommand,
options: [
{
name: "name",
description: "Write the name of the playlist you want to delete.",
type: ApplicationCommandOptionType.String,
required: true
}
]
},
{
name: "add-music",
description: "It allows you to add music to the playlist.",
type: ApplicationCommandOptionType.Subcommand,
options: [
{
name: "playlist-name",
description: "Write a playlist name.",
type: ApplicationCommandOptionType.String,
required: true
},
{
name: "name",
description: "Write a music name or a music link.",
type: ApplicationCommandOptionType.String,
required: true
}
]
},
{
name: "delete-music",
description: "It allows you to delete music to the playlist.",
type: ApplicationCommandOptionType.Subcommand,
options: [
{
name: "playlist-name",
description: "Write a playlist name.",
type: ApplicationCommandOptionType.String,
required: true
},
{
name: "name",
description: "Write a music name.",
type: ApplicationCommandOptionType.String,
required: true
}
]
},
{
name: "list",
description: "Browse music in a playlist.",
type: ApplicationCommandOptionType.Subcommand,
options: [
{
name: "name",
description: "Write a playlist name.",
type: ApplicationCommandOptionType.String,
required: true
}
]
},
{
name: "lists",
description: "Browse all your playlists.",
type: ApplicationCommandOptionType.Subcommand,
options: []
},
{
name: "top",
description: "Most popular playlists.",
type: ApplicationCommandOptionType.Subcommand,
options: []
}

],
permissions: "0x0000000000000800",
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
try {

    let stp = interaction.options.getSubcommand()
if (stp === "create") {
let name = interaction.options.getString('name')
let public = interaction.options.getBoolean('public')
if (!name) return interaction.reply({ content: lang.msg91, ephemeral: true }).catch(e => { })
const userplaylist = await db.playlist.findOne({ userID: interaction.user.id })

const playlist = await db.playlist.find().catch(e => { })
if (playlist?.length > 0) {
for (let i = 0; i < playlist.length; i++) {
if (playlist[i]?.playlist?.filter(p => p.name === name)?.length > 0) {
return interaction.reply({ content: lang.msg92, ephemeral: true }).catch(e => { })
}
}
}

if (userplaylist?.playlist?.length >= client.config.playlistSettings.maxPlaylist) return interaction.reply({ content: lang.msg93, ephemeral: true }).catch(e => { })

await interaction.reply({ content: `<@${interaction.member.id}>, ${lang.msg94}` }).catch(e => { })

await db.playlist.updateOne({ userID: interaction.user.id }, {
$push: {
playlist: {
name: name,
author: interaction.user.id,
authorTag: interaction.user.tag,
public: public,
plays: 0,
createdTime: Date.now()
}
}
}, { upsert: true }).catch(e => { })

await interaction.editReply({ content: `<@${interaction.member.id}>, ${lang.msg95}` }).catch(e => { })
}

if (stp === "delete") {
let name = interaction.options.getString('name')
if (!name) return interaction.reply({ content: lang.msg91, ephemeral: true }).catch(e => { })

const playlist = await db.playlist.findOne({ userID: interaction.user.id }).catch(e => { })
if (!playlist?.playlist?.filter(p => p.name === name).length > 0) return interaction.reply({ content: lang.msg96, ephemeral: true }).catch(e => { })

const music_filter = playlist?.musics?.filter(m => m.playlist_name === name)
if (music_filter?.length > 0){
await db.playlist.updateOne({ userID: interaction.user.id }, {
$pull: {
musics: {
playlist_name: name
}
}
}).catch(e => { })
}

await interaction.reply({ content: `<@${interaction.member.id}>, ${lang.msg97}` }).catch(e => { })

await db.playlist.updateOne({ userID: interaction.user.id }, {
$pull: {
playlist: {
name: name
}
}
}, { upsert: true }).catch(e => { })

await interaction.editReply({ content: `<@${interaction.member.id}>, ${lang.msg98}` }).catch(e => { })
}

if (stp === "add-music") {
let name = interaction.options.getString('name')
if (!name) return interaction.reply({ content: lang.msg99, ephemeral: true }).catch(e => { })
let playlist_name = interaction.options.getString('playlist-name')
if (!playlist_name) return interaction.reply({ content: lang.msg100, ephemeral: true }).catch(e => { })

const playlist = await db.playlist.findOne({ userID: interaction.user.id }).catch(e => { })
if (!playlist?.playlist?.filter(p => p.name === playlist_name).length > 0) return interaction.reply({ content: lang.msg96, ephemeral: true }).catch(e => { })

let max_music = client.config.playlistSettings.maxMusic
if (playlist?.musics?.filter(m => m.playlist_name === playlist_name).length > max_music) return interaction.reply({ content: lang.msg101.replace("{max_music}", max_music), ephemeral: true }).catch(e => { })
let res 
try{
res = await client.player.search(name, {
    member: interaction.member,
    textChannel: interaction.channel,
    interaction
    })
} catch (e) {
return interaction.reply({ content: lang.msg74, ephemeral: true }).catch(e => { })
}
if(!res || !res.length || !res.length > 1) return interaction.reply({ content: lang.msg74, ephemeral: true }).catch(e => { })

await interaction.reply({ content: `<@${interaction.member.id}>, ${lang.msg102}` }).catch(e => { })

const music_filter = playlist?.musics?.filter(m => m.playlist_name === playlist_name && m.music_name === res[0]?.name)
if (music_filter?.length > 0) return interaction.editReply({ content: lang.msg104, ephemeral: true }).catch(e => { })

await db.playlist.updateOne({ userID: interaction.user.id }, {
$push: {
musics: {
playlist_name: playlist_name,
music_name: res[0]?.name,
music_url: res[0]?.url,
saveTime: Date.now()
}
}
}, { upsert: true }).catch(e => { })

await interaction.editReply({ content: `<@${interaction.member.id}>, \`${res[0]?.name}\` ${lang.msg105}` }).catch(e => { })

}

if (stp === "delete-music") {
let name = interaction.options.getString('name')
if (!name) return interaction.reply({ content: lang.msg99, ephemeral: true }).catch(e => { })
let playlist_name = interaction.options.getString('playlist-name')
if (!playlist_name) return interaction.reply({ content: lang.msg106, ephemeral: true }).catch(e => { })

const playlist = await db.playlist.findOne({ userID: interaction.user.id }).catch(e => { })
if (!playlist?.playlist?.filter(p => p.name === playlist_name).length > 0) return interaction.reply({ content: lang.msg96, ephemeral: true }).catch(e => { })

const music_filter = playlist?.musics?.filter(m => m.playlist_name === playlist_name && m.music_name === name)
if (!music_filter?.length > 0) return interaction.reply({ content: lang.msg54, ephemeral: true }).catch(e => { })

await interaction.reply({ content: `<@${interaction.member.id}>, ${lang.msg108}` }).catch(e => { })

await db.playlist.updateOne({ userID: interaction.user.id }, {
$pull: {
musics: {
playlist_name: playlist_name,
music_name: name
}
}
}, { upsert: true }).catch(e => { })

await interaction.editReply({ content: `<@${interaction.member.id}>, ${lang.msg109}` }).catch(e => { })
}

if (stp === "list") {
let name = interaction.options.getString('name')
if (!name) return interaction.reply({ content: lang.msg110, ephemeral: true }).catch(e => { })

let trackl

const playlist = await db.playlist.find().catch(e => { })
if (!playlist?.length > 0) return interaction.reply({ content: lang.msg96, ephemeral: true }).catch(e => { })

let arr = 0
for (let i = 0; i < playlist.length; i++) {
if (playlist[i]?.playlist?.filter(p => p.name === name)?.length > 0) {

let playlist_owner_filter = playlist[i].playlist.filter(p => p.name === name)[0].author
let playlist_public_filter = playlist[i].playlist.filter(p => p.name === name)[0].public

if (playlist_owner_filter !== interaction.member.id) {
if (playlist_public_filter === false) {
return interaction.reply({ content: lang.msg53, ephemeral: true }).catch(e => { })
}
}

trackl = await playlist[i]?.musics?.filter(m => m.playlist_name === name)
if (!trackl?.length > 0) return interaction.reply({ content: lang.msg111, ephemeral: true }).catch(e => { })

} else {
arr++
if (arr === playlist.length) {
return interaction.reply({ content: lang.msg58, ephemeral: true }).catch(e => { })
}
}
}

const backId = "emojiBack"
const forwardId = "emojiForward"
const backButton = new ButtonBuilder({
style: ButtonStyle.Secondary,
emoji: "⬅️",
customId: backId
});

const deleteButton = new ButtonBuilder({
style: ButtonStyle.Secondary,
emoji: "❌",
customId: "close"
});

const forwardButton = new ButtonBuilder({
style: ButtonStyle.Secondary,
emoji: "➡️",
customId: forwardId
});


let kaçtane = 8
let page = 1
let a = trackl.length / kaçtane

const generateEmbed = async (start) => {
let sayı = page === 1 ? 1 : page * kaçtane - kaçtane + 1
const current = trackl.slice(start, start + kaçtane)
if (!current || !current?.length > 0) return interaction.reply({ content: lang.msg111, ephemeral: true }).catch(e => { })
return new EmbedBuilder()
.setTitle(`${name}`)
.setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
.setColor(client.config.embedColor)
.setDescription(`${lang.msg119}\n${current.map(data =>
`\n\`${sayı++}\` | [${data.music_name}](${data.music_url}) - <t:${Math.floor(data.saveTime / 1000)}:R>`
)}`)
.setFooter({ text: `${lang.msg67} ${page}/${Math.floor(a+1)}` })
}

const canFitOnOnePage = trackl.length <= kaçtane

await interaction.reply({
embeds: [await generateEmbed(0)],
components: canFitOnOnePage
? []
: [new ActionRowBuilder({ components: [deleteButton, forwardButton] })],
fetchReply: true
}).then(async Message => {
const filter = i => i.user.id === interaction.user.id
const collector = Message.createMessageComponentCollector({ filter, time: 65000 });


let currentIndex = 0
collector.on("collect", async (button) => {
if (button.customId === "close") {
collector.stop()
return button.reply({ content: `${lang.msg68}`, ephemeral: true }).catch(e => { })
} else {

if (button.customId === backId) {
page--
}
if (button.customId === forwardId) {
page++
}

button.customId === backId
? (currentIndex -= kaçtane)
: (currentIndex += kaçtane)

await interaction.editReply({
embeds: [await generateEmbed(currentIndex)],
components: [
new ActionRowBuilder({
components: [
...(currentIndex ? [backButton] : []),
deleteButton,
...(currentIndex + kaçtane < trackl.length ? [forwardButton] : []),
],
}),
],
}).catch(e => { })
await button.deferUpdate().catch(e => {})
}
})

collector.on("end", async (button) => {
button = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setStyle(ButtonStyle.Secondary)
.setEmoji("⬅️")
.setCustomId(backId)
.setDisabled(true),
new ButtonBuilder()
.setStyle(ButtonStyle.Secondary)
.setEmoji("❌")
.setCustomId("close")
.setDisabled(true),
new ButtonBuilder()
.setStyle(ButtonStyle.Secondary)
.setEmoji("➡️")
.setCustomId(forwardId)
.setDisabled(true))

const embed = new EmbedBuilder()
.setTitle(`${name}`)
.setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
.setColor(client.config.embedColor)
.setDescription(lang.msg118.replace("{name}", name))
.setFooter({ text: `MusicMaker ❤️` })
return interaction.editReply({ embeds: [embed], components: [button] }).catch(e => { })

})
}).catch(e => { })

}

if (stp === "lists") {
const playlist = await db?.playlist?.findOne({ userID: interaction.user.id }).catch(e => { })
if (!playlist?.playlist?.length > 0) return interaction.reply({ content: lang.msg117, ephemeral: true }).catch(e => { })

let number = 1
const embed = new EmbedBuilder()
.setTitle(lang.msg115)
.setColor(client.config.embedColor)
.setDescription(`${lang.msg119}\n${playlist?.playlist?.map(data =>
`\n**${number++} |** \`${data.name}\` - **${playlist?.musics?.filter(m => m.playlist_name === data.name)?.length || 0}** ${lang.msg116} (<t:${Math.floor(data.createdTime / 1000)}:R>)`
)}`)
.setFooter({ text: `MusicMaker ❤️` })
return interaction.reply({ embeds: [embed] }).catch(e => { })

}

if (stp === "top") {
let playlists = await db?.playlist?.find().catch(e => { })
if (!playlists?.length > 0) return interaction.reply({ content: lang.msg114, ephemeral: true }).catch(e => { })

let trackl = []
playlists.map(async data => {
data.playlist.filter(d => d.public === true).map(async d => {
let filter = data.musics.filter(m => m.playlist_name === d.name)
if(filter.length > 0) {
trackl.push(d)
}
})
})

trackl = trackl.filter(a => a.plays > 0) 

if (!trackl?.length > 0) return interaction.reply({ content: lang.msg114, ephemeral: true }).catch(e => { })

trackl = trackl.sort((a, b) => b.plays - a.plays)

const backId = "emojiBack"
const forwardId = "emojiForward"
const backButton = new ButtonBuilder({
style: ButtonStyle.Secondary,
emoji: "⬅️",
customId: backId
});

const deleteButton = new ButtonBuilder({
style: ButtonStyle.Secondary,
emoji: "❌",
customId: "close"
});

const forwardButton = new ButtonBuilder({
style: ButtonStyle.Secondary,
emoji: "➡️",
customId: forwardId
});


let kaçtane = 8
let page = 1
let a = trackl.length / kaçtane

const generateEmbed = async (start) => {
let sayı = page === 1 ? 1 : page * kaçtane - kaçtane + 1
const current = trackl.slice(start, start + kaçtane)
if (!current || !current?.length > 0) return interaction.reply({ content: lang.msg114, ephemeral: true }).catch(e => { })
return new EmbedBuilder()
.setTitle(lang.msg112)
.setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
.setColor(client.config.embedColor)
.setDescription(`${lang.msg119}\n${current.map(data =>
`\n**${sayı++} |** \`${data.name}\` By. \`${data.authorTag}\` - **${data.plays}** ${lang.msg129} (<t:${Math.floor(data.createdTime / 1000)}:R>)`
)}`)
.setFooter({ text: `${lang.msg67} ${page}/${Math.floor(a+1)}` })
}

const canFitOnOnePage = trackl.length <= kaçtane

await interaction.reply({
embeds: [await generateEmbed(0)],
components: canFitOnOnePage
? []
: [new ActionRowBuilder({ components: [deleteButton, forwardButton] })],
fetchReply: true
}).then(async Message => {
const filter = i => i.user.id === interaction.user.id
const collector = Message.createMessageComponentCollector({ filter, time: 120000 });


let currentIndex = 0
collector.on("collect", async (button) => {
if (button.customId === "close") {
collector.stop()
return button.reply({ content: `${lang.msg68}`, ephemeral: true }).catch(e => { })
} else {

if (button.customId === backId) {
page--
}
if (button.customId === forwardId) {
page++
}

button.customId === backId
? (currentIndex -= kaçtane)
: (currentIndex += kaçtane)

await interaction.editReply({
embeds: [await generateEmbed(currentIndex)],
components: [
new ActionRowBuilder({
components: [
...(currentIndex ? [backButton] : []),
deleteButton,
...(currentIndex + kaçtane < trackl.length ? [forwardButton] : []),
],
}),
],
}).catch(e => { })
await button.deferUpdate().catch(e => { })
}
})

collector.on("end", async (button) => {
button = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setStyle(ButtonStyle.Secondary)
.setEmoji("⬅️")
.setCustomId(backId)
.setDisabled(true),
new ButtonBuilder()
.setStyle(ButtonStyle.Secondary)
.setEmoji("❌")
.setCustomId("close")
.setDisabled(true),
new ButtonBuilder()
.setStyle(ButtonStyle.Secondary)
.setEmoji("➡️")
.setCustomId(forwardId)
.setDisabled(true))

const embed = new EmbedBuilder()
.setTitle(lang.msg112)
.setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
.setColor(client.config.embedColor)
.setDescription(lang.msg113)
.setFooter({ text: `MusicMaker ❤️` })
return interaction.editReply({ embeds: [embed], components: [button] }).catch(e => { })

})
}).catch(e => { })
}

} catch (e) {
    const errorNotifer = require("../functions.js")
   errorNotifer(client, interaction, e, lang)
    }
},
};