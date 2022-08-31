const db = require("../mongoDB");
module.exports = {
name: "resume",
description: "Restarts paused music.",
permissions: "0x0000000000000800",
options: [],
voiceChannel: true,
run: async (client, interaction) => {
const queue = client.player.getQueue(interaction.guild.id);
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
if (!queue) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })

const success = queue.setPaused(false);

return interaction.reply({ content: success ? `**${queue.current.title}**, ${lang.msg72}` : lang.msg71 }).catch(e => { })
},
};
