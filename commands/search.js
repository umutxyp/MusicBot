const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QueryType } = require('discord-player');
const db = require("../mongoDB");
module.exports = {
name: "search",
description: "Used for your music search",
permissions: "0x0000000000000800",
options: [{
name: 'name',
description: 'Type the name of the music you want to play.',
type: ApplicationCommandOptionType.String,
required: true
}],
voiceChannel: true,
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
const name = interaction.options.getString('name')
if (!name) return interaction.reply({ content: lang.msg73, ephemeral: true }).catch(e => { })

const res = await client.player.search(name, {
requestedBy: interaction.member,
searchEngine: QueryType.AUTO
});
if(!res || !res.tracks.length || !res.tracks.length > 1) return interaction.reply({ content: lang.msg74, ephemeral: true }).catch(e => { })

const queue = await client.player.createQueue(interaction.guild, {
leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
metadata: interaction.channel
})

    
const embed = new EmbedBuilder();
embed.setColor(client.config.embedColor);
embed.setTitle(`${lang.msg75}: ${name}`);

const maxTracks = res.tracks.slice(0, 10);

let track_button_creator = maxTracks.map((track, index) => {
return new ButtonBuilder()
.setLabel(`${index + 1}`)
.setStyle(ButtonStyle.Secondary)
.setCustomId(`${index + 1}`)
})

let buttons1 
let buttons2
if(track_button_creator.length > 10) {
buttons1 = new ActionRowBuilder().addComponents(track_button_creator.slice(0, 5))
buttons2 = new ActionRowBuilder().addComponents(track_button_creator.slice(5, 10))
} else {
if(track_button_creator.length > 5) {
buttons1 = new ActionRowBuilder().addComponents(track_button_creator.slice(0, 5))
buttons2 = new ActionRowBuilder().addComponents(track_button_creator.slice(5, Number(track_button_creator.length)))
} else {
buttons1 = new ActionRowBuilder().addComponents(track_button_creator)
}
}

let cancel = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setLabel(lang.msg81)
.setStyle(ButtonStyle.Danger)
.setCustomId('cancel'))

embed.setDescription(`${maxTracks.map((track, i) => `**${i + 1}**. ${track.title} | \`${track.author}\``).join('\n')}\n\n${lang.msg76.replace("{maxTracks.length}", maxTracks.length)}`);
embed.setTimestamp();
embed.setFooter({ text: `codeshare.me | Umut Bayraktar ❤️` })

let code 
if(buttons1 && buttons2) {
code = { embeds: [embed], components: [buttons1, buttons2, cancel] }
} else {
code = { embeds: [embed], components: [buttons1, cancel] }
}
interaction.reply(code).then(async Message => {
const filter = i =>  i.user.id === interaction.user.id
let collector = await interaction.channel.createMessageComponentCollector({filter, time: 60000 })

collector.on('collect', async(button) => {
switch (button.customId) {
case 'cancel':{
embed.setDescription(`${lang.msg77}`)
await interaction.editReply({ embeds: [embed], components: [] }).catch(e => { })
return collector.stop();
}
break;
default:{

try {
if (!queue.connection) await queue.connect(interaction.member.voice.channelId);
} catch {
await client.player.deleteQueue(interaction.guild.id);
return interaction.reply({ content: lang.msg55, ephemeral: true }).catch(e => { })
}

await interaction.reply({ content: lang.msg78 }).catch(e => { })

queue.addTrack(res.tracks[Number(button.customId) - 1]);
if (!queue.playing) await queue.play()
embed.setDescription(`**${res.tracks[Number(button.customId) - 1].title}** ${lang.msg79}`)
await interaction.editReply({ embeds: [embed], components: [] }).catch(e => { })
return collector.stop();
}
}
});

collector.on('end', (msg, reason) => {

if (reason === 'time'){
embed.setDescription(lang.msg80)
return interaction.editReply({ embeds: [embed], components: [] }).catch(e => { })
}
})

}).catch(e => { })
},
};
