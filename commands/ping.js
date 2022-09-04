const { EmbedBuilder } = require('discord.js')
const db = require("../mongoDB");
module.exports = {
  name: "ping",
  description: "It helps you to get information about the speed of the bot.",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);

    try {

      const start = Date.now();
      interaction.reply("Pong!").then(msg => {
        const end = Date.now();
        const embed = new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setTitle(client.user.username + " - Pong!")
          .setThumbnail(client.user.displayAvatarURL())
          .addFields([
            { name: lang.msg49, value: `\`${end - start}ms\` 🛰️` },
            { name: lang.msg50, value: `\`${Date.now() - start}ms\` 🛰️` },
            { name: lang.msg51, value: `\`${Math.round(client.ws.ping)}ms\` 🛰️` }
          ])
          .setTimestamp()
          .setFooter({ text: `codeshare.me | Umut Bayraktar ❤️` })
        return interaction.editReply({ embeds: [embed] }).catch(e => { });
      }).catch(err => { })

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
