module.exports = {
name: "stop",
description: "Plays the previous music again.",
permissions: "0x0000000000000800",
options: [],
run: async (client, interaction) => {
    let lang = client.language
const queue = client.player.getQueue(interaction.guild.id);

if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })

queue.destroy();

interaction.reply({ content: lang.msg85 }).catch(e => { })
},
};
