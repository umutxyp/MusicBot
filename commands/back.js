const db = require("../mongoDB");
module.exports = {
name: "back",
description: "Plays the previous track.",
permissions: "0x0000000000000800",
options: [],
  voiceChannel: true,
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
const queue = client.player.getQueue(interaction.guild.id);

if (!queue || !queue.playing) return interaction.reply({ content: `${lang.msg5}`, ephemeral: true }).catch(e => { })

if (!queue.previousTracks[1]) return interaction.reply({ content: `${lang.msg17}`, ephemeral: true }).catch(e => { })

await queue.back();

interaction.reply({ content: `${lang.msg18.replace("{queue.previousTracks[1].title}", queue.previousTracks[1].title)}` }).catch(e => { })
},
};
