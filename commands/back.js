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
    try {
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) return interaction.reply({ content: `${lang.msg5}`, ephemeral: true }).catch(e => { })
      try {
        let song = await queue.previous()
        interaction.reply({ content: `${lang.msg18.replace("{queue.previousTracks[1].title}", song.name)}` }).catch(e => { })
      } catch (e) {
        return interaction.reply({ content: `${lang.msg17}`, ephemeral: true }).catch(e => { })
      }
    } catch (e) {
      const errorNotifer = require("../functions.js")
     errorNotifer(client, interaction, e, lang)
      }
  },
};