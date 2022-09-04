const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
  name: "queue",
  description: "It shows you the playlist.",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {

      let cmds = await db.queue.findOne({ userID: interaction.user.id, guildID: interaction.guild.id, channelID: interaction.channel.id }).catch(e => { });
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })
      if (!queue.songs[0]) return interaction.reply({ content: lang.msg63, ephemeral: true }).catch(e => { })
      if (cmds) return interaction.reply({ content: `${lang.msg34}\nhttps://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${cmds.messageID}`, ephemeral: true }).catch(e => { })


      const trackl = []
      queue.songs.map(async (track, i) => {
        trackl.push({
          title: track.name,
          author: track.uploader.name,
          user: track.user,
          url: track.url,
          duration: track.duration
        })
      })

      const backId = "emojiBack"
      const forwardId = "emojiForward"
      const backButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: "⬅️",
        customId: backId
      });

      const deleteButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: "❌",
        customId: "close"
      });

      const forwardButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: "➡️",
        customId: forwardId
      });


      let kaçtane = 8
      let page = 1
      let a = trackl.length / kaçtane

      const generateEmbed = async (start) => {
        let sayı = page === 1 ? 1 : page * kaçtane - kaçtane + 1
        const current = trackl.slice(start, start + kaçtane)
        if (!current || !current?.length > 0) return interaction.reply({ content: lang.msg63, ephemeral: true }).catch(e => { })
        return new EmbedBuilder()
          .setTitle(`${lang.msg64} - ${interaction.guild.name}`)
          .setThumbnail(interaction.guild.iconURL({ size: 2048, dynamic: true }))
          .setColor(client.config.embedColor)
          .setDescription(`${lang.msg65}: \`${queue.songs[0].name}\`
    ${current.map(data =>
            `\n\`${sayı++}\` | [${data.title}](${data.url}) | **${data.author}** (${lang.msg66} <@${data.user.id}>)`
          )}`)
          .setFooter({ text: `${lang.msg67} ${page}/${Math.floor(a + 1)}` })
      }

      const canFitOnOnePage = trackl.length <= kaçtane

      await interaction.reply({
        embeds: [await generateEmbed(0)],
        components: canFitOnOnePage
          ? []
          : [new ActionRowBuilder({ components: [deleteButton, forwardButton] })],
        fetchReply: true
      }).then(async Message => {
        await db.queue.updateOne({ userID: interaction.user.id, guildID: interaction.guild.id, channelID: interaction.channel.id }, {
          $set: {
            messageID: Message.id
          }
        }, { upsert: true }).catch(e => { })


        const filter = i => i.user.id === interaction.user.id
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });


        let currentIndex = 0
        collector.on("collect", async (button) => {
          if (button.customId === "close") {
            collector.stop()
            await db.queue.deleteOne({ userID: interaction.user.id, guildID: interaction.guild.id, channelID: interaction.channel.id }).catch(e => { })
            return button.reply({ content: lang.msg68, ephemeral: true }).catch(e => { })
          } else {

            if (button.customId === backId) {
              page--
            }
            if (button.customId === forwardId) {
              page++
            }

            button.customId === backId
              ? (currentIndex -= kaçtane)
              : (currentIndex += kaçtane)

            await interaction.editReply({
              embeds: [await generateEmbed(currentIndex)],
              components: [
                new ActionRowBuilder({
                  components: [
                    ...(currentIndex ? [backButton] : []),
                    deleteButton,
                    ...(currentIndex + kaçtane < trackl.length ? [forwardButton] : []),
                  ],
                }),
              ],
            }).catch(e => { })
            await button.deferUpdate().catch(e => { })
          }
        })

        collector.on("end", async (button) => {

          await db.queue.deleteOne({ userID: interaction?.user?.id, guildID: interaction?.guild?.id, channelID: interaction?.channel?.id }).catch(e => { })

          button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("⬅️")
              .setCustomId(backId)
              .setDisabled(true),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("❌")
              .setCustomId("close")
              .setDisabled(true),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("➡️")
              .setCustomId(forwardId)
              .setDisabled(true))

          const embed = new EmbedBuilder()
            .setTitle(lang.msg69)
            .setThumbnail(interaction.guild.iconURL({ size: 2048, dynamic: true }))
            .setColor(client.config.embedColor)
            .setDescription(lang.msg70)
            .setFooter({ text: `codeshare.me | Umut Bayraktar ❤️` })
          return interaction.editReply({ embeds: [embed], components: [button] }).catch(e => { })

        })
      }).catch(e => { })

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
  }
}
