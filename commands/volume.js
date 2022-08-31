const { ApplicationCommandOptionType } = require('discord.js');
const maxVol = require("../config.js").opt.maxVol;
const db = require("../mongoDB");
module.exports = {
name: "volume",
description: "Allows you to adjust the music volume.",
permissions: "0x0000000000000800",
options: [{
name: 'volume',
description: 'Type the number to adjust the volume.',
type: ApplicationCommandOptionType.Integer,
required: true
}],
voiceChannel: true,
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
if (!client.config.mongodbURL) return interaction.reply({ content: lang.error6, ephemeral: true }).catch(e => { })

const queue = client.player.getQueue(interaction.guild.id);
if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })

const vol = parseInt(interaction.options.getInteger('volume'));

if (!vol) return interaction.reply({ content: lang.msg87.replace("{queue.volume}", queue.volume).replace("{maxVol}", maxVol), ephemeral: true }).catch(e => { })

if (queue.volume === vol) return interaction.reply({ content: lang.msg88, ephemeral: true }).catch(e => { })

if (vol < 0 || vol > maxVol) return interaction.reply({ content: lang.msg89.replace("{maxVol}", maxVol), ephemeral: true }).catch(e => { })

const success = queue.setVolume(vol);
await db.musicbot.updateOne({ guildID: interaction.guild.id }, {
$set: {
volume: vol
}
}, { upsert: true });

return interaction.reply({ content: success ? `${lang.msg90} **${vol}**/**${maxVol}** 🔊` : lang.msg41 }).catch(e => { })
},
};
