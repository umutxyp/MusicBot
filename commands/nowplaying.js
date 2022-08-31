const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
name: "nowplaying",
description: "Provides information about the music being played.",
permissions: "0x0000000000000800",
options: [],
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
const queue = client.player.getQueue(interaction.guild.id);

if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })

const track = queue.current;

const embed = new EmbedBuilder();
embed.setColor(client.config.embedColor);
embed.setThumbnail(track.thumbnail);
embed.setTitle(track.title)

const methods = ['disabled', 'track', 'queue'];

const timestamp = queue.getPlayerTimestamp();
const trackDuration = timestamp.progress == 'Forever' ? 'Endless (Live)' : track.duration;

embed.setDescription(`Audio **%${queue.volume}**\nDuration **${trackDuration}**\nURL: ${track.url}\nLoop Mode **${methods[queue.repeatMode]}**\n${track.requestedBy}`);

embed.setTimestamp();
embed.setFooter({ text: `codeshare.me | Umut Bayraktar ❤️` })

const saveButton = new ButtonBuilder();
saveButton.setLabel(lang.msg47);
saveButton.setCustomId('saveTrack');
saveButton.setStyle(ButtonStyle.Success);

const row = new ActionRowBuilder().addComponents(saveButton);

interaction.reply({ embeds: [embed], components: [row] }).catch(e => { })
},
};
