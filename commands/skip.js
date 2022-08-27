const { ApplicationCommandOptionType } = require('discord.js');
module.exports = {
name: "skip",
description: "Switches the music being played.",
permissions: "0x0000000000000800",
options: [{
name: "number",
description: "Type how many songs you want to skip.",
type: ApplicationCommandOptionType.Number,
required: false
}],
run: async (client, interaction) => {
    let lang = client.language
const queue = client.player.getQueue(interaction.guild.id);
if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })

const number = interaction.options.getNumber('number');
if (number) {
if(number > queue.tracks.length) return interaction.reply({ content: lang.msg82, ephemeral: true }).catch(e => { })
await queue.skipTo(number);
return interaction.reply({ content: `**${queue.current.title}**, ${lang.msg83}` }).catch(e => { })
} else {
const success = queue.skip();
return interaction.reply({ content: success ? `**${queue.current.title}**, ${lang.msg83}` : lang.msg41 }).catch(e => { })
}
},
};
