const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");
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
  voiceChannel: true,
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {

      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })

      let number = interaction.options.getNumber('number');
      if (number) {
        if (!queue.songs.length > number) return interaction.reply({ content: lang.msg82, ephemeral: true }).catch(e => { })
        if (isNaN(number)) return interaction.reply({ content: lang.msg130, ephemeral: true }).catch(e => { })
        if (1 > number) return interaction.reply({ content: lang.msg130, ephemeral: true }).catch(e => { })

        let old = queue.songs[0];
        await client.player.jump(interaction, number).then(song => {
          return interaction.reply({ content: `**${old.name}**, ${lang.msg83}` }).catch(e => { })
        })
      } else {
        try {
          let old = queue.songs[0];
          const success = await queue.skip();
          return interaction.reply({ content: success ? `**${old.name}**, ${lang.msg83}` : lang.msg41 }).catch(e => { })
        } catch (e) {
          return interaction.reply({ content: lang.msg63, ephemeral: true }).catch(e => { })
        }
      }

    } catch (e) {
      if (client.errorLog) {
        let embed = new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setTimestamp()
          .addFields([
            { name: "Command", value: `${interaction?.commandName}` },
            { name: "Error", value: `${e.stack}` },
            { name: "User", value: `${interaction?.user?.tag} \`(${interaction?.user?.id})\``, inline: true },
            { name: "Guild", value: `${interaction?.guild?.name} \`(${interaction?.guild?.id})\``, inline: true },
            { name: "Time", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: "Command Usage Channel", value: `${interaction?.channel?.name} \`(${interaction?.channel?.id})\``, inline: true },
            { name: "User Voice Channel", value: `${interaction?.member?.voice?.channel?.name} \`(${interaction?.member?.voice?.channel?.id})\``, inline: true },
          ])
        await client.errorLog.send({ embeds: [embed] }).catch(e => { })
      } else {
        console.log(`
    Command: ${interaction?.commandName}
    Error: ${e}
    User: ${interaction?.user?.tag} (${interaction?.user?.id})
    Guild: ${interaction?.guild?.name} (${interaction?.guild?.id})
    Command Usage Channel: ${interaction?.channel?.name} (${interaction?.channel?.id})
    User Voice Channel: ${interaction?.member?.voice?.channel?.name} (${interaction?.member?.voice?.channel?.id})
    `)
      }
      return interaction.reply({ content: `${lang.error7}\n\`${e}\``, ephemeral: true }).catch(e => { })
    }
  },
};
