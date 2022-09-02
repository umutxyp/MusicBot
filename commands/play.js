const { QueryType, Track } = require('discord-player')
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
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
description: "Write the name of the playlist you want to create.",
type: ApplicationCommandOptionType.String,
required: true
}
]
},
],
voiceChannel: true,
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);

try {
let stp = interaction.options.getSubcommand()
if (stp === "playlist") {

let playlistw = interaction.options.getString('name')
const playlist = await db.playlist.find().catch(e => { })
if (!playlist?.length > 0) return interaction.reply({ content: lang.msg52, ephemeral: true }).catch(e => { })

let arr = 0
for (let i = 0; i < playlist.length; i++) {
if (playlist[i]?.playlist?.filter(p => p.name === playlistw)?.length > 0) {

let playlist_owner_filter = playlist[i].playlist.filter(p => p.name === playlistw)[0].author
let playlist_public_filter = playlist[i].playlist.filter(p => p.name === playlistw)[0].public

if (playlist_owner_filter !== interaction.member.id) {
if (playlist_public_filter === false) {
return interaction.reply({ content: lang.msg53, ephemeral: true }).catch(e => { })
}
}

const music_filter = playlist[i]?.musics?.filter(m => m.playlist_name === playlistw)
if (!music_filter?.length > 0) return interaction.reply({ content: lang.msg54, ephemeral: true }).catch(e => { })

let serverdb = await db.musicbot.findOne({ guildID: interaction.guild.id }).catch(e => { })
if (!serverdb?.volume) {
serverdb = 100
} else {
serverdb = serverdb?.volume
}

await interaction.reply({ content: lang.msg56 }).catch(e => { })

const queue = await client.player.createQueue(interaction.guild, {
initialVolume: serverdb,
leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
leaveOnEmpty: client.config.opt.voiceConfig.leaveOnEmpty.status,
leaveOnEmptyCooldown: client.config.opt.voiceConfig.leaveOnEmpty.cooldown,
autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
metadata: interaction.channel
});

let tracks = []
music_filter.map(async m => {
    tracks.push(new Track(client.player, {
        title: m.music_name,
        description: m.music_name,
        author: m.author,
        url: m.music_url,
        requestedBy: interaction.user,
        thumbnail: m.thumbnail,
        views: 0,
        duration: m.duration,
        source: m.source,
        raw: m.raw
}))
})
try {
if (!queue.playing) await queue?.connect(interaction.member.voice.channelId)
} catch {
await client.player.deleteQueue(interaction.guild.id);
return interaction.editReply({ content: lang.msg55, ephemeral: true }).catch(e => { })
}
await interaction.editReply({ content: lang.msg57.replace("{interaction.member.id}", interaction.member.id).replace("{music_filter.length}", music_filter.length) }).catch(e => { })
queue?.addTracks(tracks)
if (!queue.playing) await queue.play()

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
authorTag: p.authorTag,
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


let serverdb = await db.musicbot.findOne({ guildID: interaction.guild.id }).catch(e => { })
if (!serverdb?.volume) {
serverdb = 100
} else {
serverdb = serverdb?.volume
}
let queue
if (name.includes("youtube" || "youtu.be" || "soundcloud")) {
queue = await client.player.createQueue(interaction.guild, {
initialVolume: serverdb,
leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
leaveOnEmpty: client.config.opt.voiceConfig.leaveOnEmpty.status,
leaveOnEmptyCooldown: client.config.opt.voiceConfig.leaveOnEmpty.cooldown,
autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
metadata: interaction.channel,
async onBeforeCreateStream(track, source, _queue) {
if (source === "youtube") {
await playdl?.stream(track?.url, { discordPlayerCompatibility: true })?.stream
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

const res = await client.player.search(name, {
requestedBy: interaction.member,
searchEngine: QueryType.AUTO
});
if (!res || !res.tracks.length) return interaction.reply({ content: lang.msg60, ephemeral: true }).catch(e => { })

    
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
} catch (e) {
    if(client.errorLog){
let embed = new EmbedBuilder()
.setColor(client.config.embedColor)
.setTimestamp()
.addFields([
        { name: "Command", value: `${interaction?.commandName}` },
        { name: "Error", value: `${e.stack}` },
        { name: "User", value: `${interaction?.user?.tag} \`(${interaction?.user?.id})\``, inline: true },
        { name: "Guild", value: `${interaction?.guild?.name} \`(${interaction?.guild?.id})\``, inline: true },
        { name: "Time", value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true },
        { name: "Command Usage Channel", value: `${interaction?.channel?.name} \`(${interaction?.channel?.id})\``, inline: true },
        { name: "User Voice Channel", value: `${interaction?.member?.voice?.channel?.name} \`(${interaction?.member?.voice?.channel?.id})\``, inline: true },
    ])
    await client.errorLog.send({ embeds: [embed] }).catch(e => { })
    } else {
    console.log(`
    Command: ${interaction?.commandName}
    Error: ${e}
    User: ${interaction?.user?.tag} (${interaction?.user?.id})
    Guild: ${interaction?.guild?.name} (${interaction?.guild?.id})
    Command Usage Channel: ${interaction?.channel?.name} (${interaction?.channel?.id})
    User Voice Channel: ${interaction?.member?.voice?.channel?.name} (${interaction?.member?.voice?.channel?.id})
    `)
    }
    return interaction.reply({ content: `${lang.error7}\n\`${e}\``, ephemeral: true }).catch(e => { })
    }
},
};
