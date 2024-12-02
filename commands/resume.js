const db = require("../mongoDB");
module.exports = {
name: "resume",
description: "Start paused music.",
permissions: "0x0000000000000800",
options: [],
voiceChannel: true,
run: async (client, interaction) => {
const queue = client.player.getQueue(interaction.guild.id);
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
try {

    if (!queue) return interaction.reply({ content: lang.msg63, ephemeral: true }).catch(e => { })
    if(!queue.paused) return interaction.reply({ content: lang.msg132, ephemeral: true }).catch(e => { })
    const success = queue.resume()
    return interaction.reply({ content: success ? `**${queue.songs[0].name}**, ${lang.msg72}` : lang.msg71 }).catch(e => { })

} catch (e) {
    const errorNotifer = require("../functions.js")
   errorNotifer(client, interaction, e, lang)
    }
},
};