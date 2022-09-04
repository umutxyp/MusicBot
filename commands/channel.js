const { ApplicationCommandOptionType, ChannelType, EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
  name: "channel",
  description: "It allows you to set the channel or channels where the bot can be used.",
  permissions: "0x0000000000000020",
  options: [{
    name: "add",
    description: "Add a command usage channel.",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'channel',
        description: 'Mention a text channel.',
        type: ApplicationCommandOptionType.Channel,
        required: true
      }
    ]
  },
  {
    name: "remove",
    description: "Remove a command usage channel.",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'channel',
        description: 'Mention a text channel.',
        type: ApplicationCommandOptionType.Channel,
        required: true
      }
    ]
  }
  ],
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {

      let stp = interaction.options.getSubcommand()
      if (stp === "add") {
        const channel = interaction.options.getChannel('channel')
        if (!channel) return interaction.reply(lang.msg120).catch(e => { });

        if (channel.type !== ChannelType.GuildText) return interaction.reply({ content: `${lang.msg125}`, ephemeral: true }).catch(e => { })

        const data = await db?.musicbot?.findOne({ guildID: interaction.guild.id })

        const channel_filter = data?.channels?.filter(x => x.channel === channel.id)
        if (channel_filter?.length > 0) return interaction.reply({ content: lang.msg124, ephemeral: true }).catch(e => { })

        await db.musicbot.updateOne({ guildID: interaction.guild.id }, {
          $push: {
            channels: {
              channel: channel.id
            }
          }
        }, { upsert: true }).catch(e => { })

        return await interaction.reply({ content: lang.msg121.replace("{channel}", channel.id), ephemeral: true }).catch(e => { });

      }
      if (stp === "remove") {
        const channel = interaction.options.getChannel('channel')
        if (!channel) return interaction.reply(lang.msg120).catch(e => { });

        const data = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
        if (!data) return interaction.reply({ content: lang.msg122, ephemeral: true }).catch(e => { });

        const channel_filter = data?.channels?.filter(x => x.channel === channel.id)
        if (!channel_filter?.length > 0) return interaction.reply({ content: lang.msg122, ephemeral: true }).catch(e => { })

        await db.musicbot.updateOne({ guildID: interaction.guild.id }, {
          $pull: {
            channels: {
              channel: channel.id
            }
          }
        }, { upsert: true }).catch(e => { })

        return await interaction.reply({ content: lang.msg123.replace("{channel}", channel.id), ephemeral: true }).catch(e => { });
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
