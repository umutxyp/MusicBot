const { QueryType } = require('discord-player')
const { ApplicationCommandOptionType } = require('discord.js');
const playdl = require("play-dl");
const db = require("../mongoDB");
module.exports = {
name: "play",
description: "Play a track.",
permissions: "0x0000000000000800",
options: [
{
name: "normal",
description: "Open music from other platforms.",
type: ApplicationCommandOptionType.Subcommand,
options: [
{
name: "name",
description: "Write your music name.",
type: ApplicationCommandOptionType.String,
required: true
}
]
},
{
name: "playlist",
description: "Write your playlist name.",
type: ApplicationCommandOptionType.Subcommand,
options: [
{
name: "name",
description: "TWrite the name of the playlist you want to create.",
type: ApplicationCommandOptionType.String,
required: true
}
]
},
],
voiceChannel: true,
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction?.guild?.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
let stp = interaction.options.getSubcommand()
if (stp === "playlist") {

let playlistw = interaction.options.getString('name')
const playlist = await db.playlist.find().catch(e => { })
if (!playlist?.length > 0) return interaction.reply({ content: lang.msg52, ephemeral: true }).catch(e => { })

let arr = 0
for (let i = 0; i < playlist?.length; i++) {
if (playlist[i]?.playlist?.filter(p => p.name === playlistw)?.length > 0) {

let playlist_owner_filter = playlist[i]?.playlist?.filter(p => p.name === playlistw)[0].author
let playlist_public_filter = playlist[i]?.playlist?.filter(p => p.name === playlistw)[0].public

if (playlist_owner_filter !== interaction?.member?.id) {
if (playlist_public_filter === false) {
return interaction.reply({ content: lang.msg53, ephemeral: true }).catch(e => { })
}
}

const music_filter = playlist[i]?.musics?.filter(m => m.playlist_name === playlistw)
if (!music_filter?.length > 0) return interaction.reply({ content: lang.msg54, ephemeral: true }).catch(e => { })

let serverdb = await db.musicbot.findOne({ guildID: interaction?.guild?.id }).catch(e => { })
if (!serverdb?.volume) {
serverdb = 100
} else {
serverdb = serverdb?.volume
}
const queue = await client.player.createQueue(interaction?.guild, {
initialVolume: serverdb,
leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
leaveOnEmpty: client.config.opt.voiceConfig.leaveOnEmpty.status,
leaveOnEmptyCooldown: client.config.opt.voiceConfig.leaveOnEmpty.cooldown,
autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
metadata: interaction.channel
});

await music_filter.map(async m => {
let res
setTimeout(async () => {
if (m.music_url.includes("youtube")) {
res = await client.player.search(m.music_name, {
requestedBy: interaction.member,
searchEngine: QueryType.AUTO
});
} else {
res = await client.player.search(m.music_url, {
requestedBy: interaction.member,
searchEngine: QueryType.AUTO
});
}

queue.addTrack(res?.tracks[0])
}, 2000)
})
try {
if (!queue.playing) await queue?.connect(interaction.member.voice.channelId)
} catch {
await client.player.deleteQueue(interaction.guild.id);
return interaction.reply({ content: lang.msg55, ephemeral: true }).catch(e => { })
}
await interaction.reply({ content: lang.msg56 }).catch(e => { })
setTimeout(async () => {
if (!queue.playing) await queue?.play()
await interaction.editReply({ content: lang.msg57.replace("{interaction.member.id}", interaction.member.id).replace("{music_filter.length}", music_filter.length) }).catch(e => { })
}, 5000)

playlist[i]?.playlist?.filter(p => p.name === playlistw).map(async p => {
await db.playlist.updateOne({ userID: p.author }, {
$pull: {
playlist: {
name: playlistw
}
}
}, { upsert: true }).catch(e => { })

await db.playlist.updateOne({ userID: p.author }, {
$push: {
playlist: {
name: p.name,
author: p.author,
public: p.public,
plays: Number(p.plays) + 1,
createdTime: p.createdTime
}
}
}, { upsert: true }).catch(e => { })
})
} else {
arr++
if (arr === playlist.length) {
return interaction.reply({ content: lang.msg58, ephemeral: true }).catch(e => { })
}
}
}
}

if (stp === "normal") {
const name = interaction.options.getString('name')
if (!name) return interaction.reply({ content: lang.msg59, ephemeral: true }).catch(e => { })

const res = await client.player.search(name, {
requestedBy: interaction.member,
searchEngine: QueryType.AUTO
});
if (!res || !res.tracks.length) return interaction.reply({ content: lang.msg60, ephemeral: true }).catch(e => { })


let serverdb = await db.musicbot.findOne({ guildID: interaction.guild.id }).catch(e => { })
if (!serverdb?.volume) {
serverdb = 100
} else {
serverdb = serverdb?.volume
}
let queue
if (res?.playlist?.url?.includes("youtube" || "soundcloud") || res?.tracks[0]?.url?.includes("youtube" || "soundcloud")) {
queue = await client.player.createQueue(interaction.guild, {
initialVolume: serverdb,
leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
leaveOnEmpty: client.config.opt.voiceConfig.leaveOnEmpty.status,
autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
metadata: interaction.channel,
async onBeforeCreateStream(track, source, _queue) {
// only trap youtube source
if (source === "youtube") {
// track here would be youtube track
return (await playdl.stream(track.url, { discordPlayerCompatibility: true })).stream;
// we must return readable stream or void (returning void means telling discord-player to look for default extractor)
}
}
})
} else {
queue = await client.player.createQueue(interaction.guild, {
initialVolume: serverdb,
leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
leaveOnEmpty: client.config.opt.voiceConfig.leaveOnEmpty.status,
leaveOnEmptyCooldown: client.config.opt.voiceConfig.leaveOnEmpty.cooldown,
autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
metadata: interaction.channel
})
}

try {
if (!queue.playing) await queue.connect(interaction.member.voice.channelId)
} catch {
await client.player.deleteQueue(interaction.guild.id);
return interaction.reply({ content: lang.msg55, ephemeral: true }).catch(e => { })
}
let msg = res.playlist ? `<@${interaction.member.id}>, \`${res.playlist.title}\` ${lang.msg61}` : `<@${interaction.member.id}>, **${res.tracks[0].title}** ${lang.msg62}`
await interaction.reply({ content: msg }).catch(e => { })
res.playlist ? queue.addTracks(res?.tracks) : queue.addTrack(res?.tracks[0]);
if (!queue.playing) await queue.play()
}
},
};
