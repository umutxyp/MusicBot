const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const db = require("../mongoDB");
module.exports = {
  name: "help",
  description: "It helps you to get information about bot and commands.",
  permissions: "0x0000000000000800",
  options: [
    {
      name: "info",
      description: "The command you want to get information about.",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],
  showHelp: false,
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {

      const info = interaction.options.getString('info');
      if (info) {
        const cmd_filter = client.commands.filter(x => x.name === info);
        if (!cmd_filter.length > 0) return interaction.reply({ content: lang.msg127, ephemeral: true }).catch(e => { })

        const cmd = cmd_filter[0]
        const embed = new EmbedBuilder()
          .setTitle(`Command Info: ${cmd.name}`)
          .setDescription(`> **Description: \`${cmd.description}\`**\n> **Options:**\n${cmd?.options?.map(x => `> **\`${x.name}\` - \`${x.description}\`**`).join("\n")}`)
          .setColor(client.config.embedColor)
          .setTimestamp()
        return interaction.reply({ embeds: [embed] }).catch(e => { })

      } else {
        const commands = client.commands.filter(x => x.showHelp !== false);

        const embed = new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setTitle("/help info <command>")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription(lang.msg32)
          .addFields([
            { name: `${lang.msg33}`, value: commands.map(x => `\`/${x.name}\``).join(' | ') }
          ])
          .setTimestamp()
          .setFooter({ text: `codeshare.me | Umut Bayraktar ❤️` })
        interaction.reply({ embeds: [embed] }).catch(e => { })
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
