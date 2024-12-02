const { ApplicationCommandOptionType } = require('discord.js')
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
      const { EmbedBuilder } = require('discord.js');
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
          .setFooter({ text: `MusicMaker ❤️` })
        interaction.reply({ embeds: [embed] }).catch(e => { })
      }

    } catch (e) {
      const errorNotifer = require("../functions.js")
     errorNotifer(client, interaction, e, lang)
      }
  },
};