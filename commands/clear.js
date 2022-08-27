module.exports = {
name: "clear",
description: "Clears the music queue.",
permissions: "0x0000000000000800",
options: [],
run: async (client, interaction) => {
const queue = client.player.getQueue(interaction.guild.id);
let lang = client.language
if (!queue || !queue.playing) return interaction.reply({ content: `${lang.msg5}`, ephemeral: true }).catch(e => { })

if (!queue.tracks[0]) return interaction.reply({ content: `${lang.msg23}`, ephemeral: true }).catch(e => { })

await queue.clear();

interaction.reply({ content: `${lang.msg24}` }).catch(e => { })
},
}
