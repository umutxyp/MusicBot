const db = require("../mongoDB");
module.exports = {
name: "pause",
description: "Stops playing the currently playing music.",
permissions: "0x0000000000000800",
options: [],
  voiceChannel: true,
run: async (client, interaction) => {

const queue = client.player.getQueue(interaction.guild.id);
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })

const success = queue.setPaused(true);

return interaction.reply({ content: success ? `**${queue.current.title}** - ${lang.msg48}` : lang.msg41 }).catch(e => { })
},
}
