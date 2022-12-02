const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
  name: "language",
  description: "It allows you to set the language of the bot.",
  permissions: "0x0000000000000020",
  options: [],
  voiceChannel: false,
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {

      let buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Türkçe")
          .setCustomId('tr')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("English")
          .setCustomId('en')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Nederlands")
          .setCustomId('nl')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Arabic")
          .setCustomId('ar')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Français")
          .setCustomId('fr')
          .setStyle(ButtonStyle.Secondary)
      )

      let buttons2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setLabel("Português")
            .setCustomId('pt')
            .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
            .setLabel("正體中文")
            .setCustomId('zh_TW')
            .setStyle(ButtonStyle.Secondary)
        )

      let embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle("Select a language")
        .setTimestamp()
        .setFooter({ text: `MusicMaker ❤️` })
      interaction.reply({ embeds: [embed], components: [buttons, buttons2] }).then(async Message => {

        const filter = i => i.user.id === interaction.user.id
        let col = await interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        col.on('collect', async (button) => {
          if (button.user.id !== interaction.user.id) return
          switch (button.customId) {
            case 'tr':
              await db?.musicbot?.updateOne({ guildID: interaction.guild.id }, {
                $set: {
                  language: 'tr'
                }
              }, { upsert: true }).catch(e => { })
              await interaction.editReply({ content: `Botun dili başarıyla türkçe oldu. :flag_tr:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button.deferUpdate().catch(e => { })
              await col.stop()
              break
              
            case 'en':
              await db?.musicbot?.updateOne({ guildID: interaction.guild.id }, {
                $set: {
                  language: 'en'
                }
              }, { upsert: true }).catch(e => { })
              await interaction.editReply({ content: `Bot language successfully changed to english. :flag_gb:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button.deferUpdate().catch(e => { })
              await col.stop()
              break

            case 'nl':
              await db?.musicbot?.updateOne({ guildID: interaction.guild.id }, {
                $set: {
                  language: 'nl'
                }
              }, { upsert: true }).catch(e => { })
              await interaction.editReply({ content: `De taal van de bot was nederlands. :flag_nl:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button.deferUpdate().catch(e => { })
              await col.stop()
              break

              case 'fr':
              await db?.musicbot?.updateOne({ guildID: interaction.guild.id }, {
                $set: {
                  language: 'fr'
                }
              }, { upsert: true }).catch(e => { })
              await interaction.editReply({ content: `La langue du bot a été modifiée avec succès en français. :flag_fr:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button.deferUpdate().catch(e => { })
              await col.stop()
              break

              case 'pt':
              await db?.musicbot?.updateOne({ guildID: interaction.guild.id }, {
                $set: {
                  language: 'pt'
                }
              }, { upsert: true }).catch(e => { })
              await interaction.editReply({ content: `Língua do bot definida para Português - Brasil com sucesso. :flag_br:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button.deferUpdate().catch(e => { })
              await col.stop()
              break

              case 'ar':
                await db?.musicbot?.updateOne({ guildID: interaction.guild.id }, {
                  $set: {
                    language: 'ar'
                  }
                }, { upsert: true }).catch(e => { })
                await interaction.editReply({ content: `تم تغيير لغة البوت بنجاح إلى اللغة العربية: :flag_ps:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
                await button.deferUpdate().catch(e => { })
                await col.stop()
                break
              
			case 'zh_TW':
        await db?.musicbot?.updateOne({ guildID: interaction.guild.id }, {
          $set: {
            language: 'zh_TW'
          }
        }, { upsert: true }).catch(e => { })
        await interaction.editReply({ content: `機器人成功設為正體中文 :flag_tw:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
        await button.deferUpdate().catch(e => { })
        await col.stop()
        break

          }
        })

        col.on('end', async (button, reason) => {
          if (reason === 'time') {
            buttons = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(lang.msg45)
                .setCustomId("timeend")
                .setDisabled(true))

            embed = new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setTitle("Time ended, please try again.")
              .setTimestamp()
              .setFooter({ text: `MusicMaker ❤️` })

            await interaction.editReply({ embeds: [embed], components: [buttons] }).catch(e => { })
          }
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
  },
}
