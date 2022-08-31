const db = require("../mongoDB");
module.exports = {
name: "stop",
description: "Plays the previous music again.",
permissions: "0x0000000000000800",
options: [],
voiceChannel: true,
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
const queue = client.player.getQueue(interaction.guild.id);

if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })

queue.destroy();

interaction.reply({ content: lang.msg85 }).catch(e => { })
},
};
