const fs = require("fs")
const config = require("../config.js");
const { EmbedBuilder, InteractionType } = require('discord.js');
const db = require("croxydb")

module.exports = async (client, interaction) => {
if (!interaction.guild) return;
if (interaction.type === InteractionType.ApplicationCommand){
fs.readdir(config.commandsDir, (err, files) => {
if (err) throw err;
files.forEach(async (f) => {
let props = require(`.${config.commandsDir}/${f}`);
if (interaction.commandName.toLowerCase() === props.name.toLowerCase()) {
try {
if(interaction.member.permissions.has(props?.permissions || "0x0000000000000800")){
const DJ = client.config.opt.DJ;
if (props && DJ.commands.includes(interaction.commandName)) {
let djRole = await db.get(`dj-${interaction.guild.id}`)
if(djRole){
const roleDJ = interaction.guild.roles.cache.get(djRole)
if(!interaction.member.permissions.has("0x0000000000000020")){
if(roleDJ){
if(!interaction.member.roles.cache.has(roleDJ.id)){

const embed = new EmbedBuilder()
.setColor('007fff')
.setTitle(client.user.username)
.setThumbnail(client.user.displayAvatarURL())
.setDescription("You must have the <@&"+djRole+">(DJ) role set on this server to use this command. Users without this role cannot use the "+client.config.opt.DJ.commands.map(astra => '`'+astra+'`').join(", "))
.setTimestamp()
.setFooter({text: `Code Share - by Umut Bayraktar ❤️` })
return interaction.reply({ embeds: [embed], ephemeral: true}).catch(e => { })
}}}}
}
if (props && props.voiceChannel) {
if (!interaction.member.voice.channelId) return interaction.reply({ content: `You are not connected to an audio channel. ❌`, ephemeral: true}).catch(e => {})
const guild_me = interaction.guild.members.cache.get(client.user.id);
if (guild_me.voice.channelId){
if(guild_me.voice.channelId !== interaction.member.voice.channelId){
return interaction.reply({ content: `You are not on the same audio channel as me. ❌`, ephemeral: true}).catch(e => {})
}
}
}
return props.run(client, interaction);

} else {
return interaction.reply({ content: `Missing permission: **${props?.permissions}**`, ephemeral: true });
}
} catch (e) {
console.log(e);
return interaction.reply({ content: `Something went wrong...\n\n\`\`\`${e.message}\`\`\``, ephemeral: true });
}
}
});
});
}

if (interaction.type === InteractionType.MessageComponent){
const queue = client.player.getQueue(interaction.guildId);
switch (interaction.customId) {
case 'saveTrack': {
if (!queue || !queue.playing){
return interaction.reply({ content: `No music currently playing. ❌`, embeds: [], components: [], ephemeral: true }).catch(e => {})
} else {
const embed = new EmbedBuilder()
.setColor('007fff')
.setTitle(client.user.username + " - Save Track")
.setThumbnail(client.user.displayAvatarURL())
.addFields([
{ name: `Track`, value: `\`${queue.current.title}\`` },
{ name: `Duration`, value: `\`${queue.current.duration}\`` },
{ name: `URL`, value: `${queue.current.url}` },
{ name: `Saved Server`, value: `\`${interaction.guild.name}\`` },
{ name: `Requested By`, value: `${queue.current.requestedBy}` }
])
.setTimestamp()
.setFooter({text: `Code Share - by Umut Bayraktar ❤️` })
interaction.member.send({ embeds: [embed] }).then(() => {
return interaction.reply({ content: `I sent you the name of the music in a private message ✅`, embeds: [], components: [], ephemeral: true}).catch(e => { })
}).catch(error => {
return interaction.reply({ content: `I can't send you a private message. ❌`, embeds: [], components: [], ephemeral: true}).catch(e => { })
});
}
}
break
case 'time': {
if (!queue || !queue.playing){
return interaction.reply({ content: `No music currently playing. ❌`, embeds: [], components: [], ephemeral: true }).catch(e => {})
} else {

const progress = queue.createProgressBar();
const timestamp = queue.getPlayerTimestamp();

if (timestamp.progress == 'Infinity') return interaction.message.edit({ content: `This song is live streaming, no duration data to display. 🎧`, embeds: [], components: [] }).catch(e => { })

const embed = new EmbedBuilder()
.setColor('007fff')
.setTitle(queue.current.title)
.setThumbnail(client.user.displayAvatarURL())
.setTimestamp()
.setDescription(`${progress} (**${timestamp.progress}**%)`)
.setFooter({text: `Code Share - by Umut Bayraktar ❤️` })
interaction.message.edit({ embeds: [embed] }).catch(e => { })
interaction.reply({ content: `**✅ Success:** Time data updated. `, embeds: [], components: [], ephemeral: true}).catch(e => { })
}
}
}
}

}
