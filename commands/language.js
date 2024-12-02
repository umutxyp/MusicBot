const db = require("../mongoDB");
module.exports = {
  name: "language",
  description: "It allows you to set the language of the bot.",
  permissions: "0x0000000000000020",
  options: [],
  voiceChannel: false,
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction?.guild?.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {
      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      let buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Türkçe")
          .setCustomId('tr')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🇹🇷'), 
        new ButtonBuilder()
          .setLabel("English")
          .setCustomId('en')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🇬🇧'),
        new ButtonBuilder()
          .setLabel("Nederlands")
          .setCustomId('nl')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🇳🇱'),
        new ButtonBuilder()
          .setLabel("العربية")
          .setCustomId('ar')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🇸🇦'),
        new ButtonBuilder()
          .setLabel("Français")
          .setCustomId('fr')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🇫🇷'),
      )

      let buttons2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setLabel("Português")
            .setCustomId('pt')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🇧🇷'),
            new ButtonBuilder()
            .setLabel("正體中文")
            .setCustomId('zh_TW')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🇨🇳'),
	     new ButtonBuilder()
            .setLabel("Italiano")
            .setCustomId('it')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🇮🇹'),
	     new ButtonBuilder()
            .setLabel("Indonesia")
            .setCustomId('id')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🇮🇩'),
        new ButtonBuilder()
            .setLabel("Español")
            .setCustomId('es')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🇪🇸'),
        )

        let buttons3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setLabel("Русский")
            .setCustomId('ru')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🇷🇺'),
            new ButtonBuilder()
            .setLabel("Deutsch")
            .setCustomId('de')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🇩🇪'),
            new ButtonBuilder()
            .setLabel("日本語")
            .setCustomId('ja')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🇯🇵'),
        )
        

      let embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle("Select a language")
        .setTimestamp()
        .setFooter({ text: `MusicMaker ❤️` })
      interaction?.reply({ embeds: [embed], components: [buttons, buttons2, buttons3] }).then(async Message => {

        const filter = i => i.user.id === interaction?.user?.id
        let col = await Message.createMessageComponentCollector({ filter, time: 30000 });

        col.on('collect', async (button) => {
          if (button.user.id !== interaction?.user?.id) return
          switch (button.customId) {
            case 'tr':
              await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
                $set: {
                  language: 'tr'
                }
              }, { upsert: true }).catch(e => { })
              await interaction?.editReply({ content: `Botun dili başarıyla türkçe oldu. :flag_tr:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button?.deferUpdate().catch(e => { })
              await col?.stop()
              break
              
            case 'en':
              await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
                $set: {
                  language: 'en'
                }
              }, { upsert: true }).catch(e => { })
              await interaction?.editReply({ content: `Bot language successfully changed to english. :flag_gb:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button?.deferUpdate().catch(e => { })
              await col?.stop()
              break

            case 'nl':
              await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
                $set: {
                  language: 'nl'
                }
              }, { upsert: true }).catch(e => { })
              await interaction?.editReply({ content: `De taal van de boot werd veranderd in nederlands. :flag_nl:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button?.deferUpdate().catch(e => { })
              await col?.stop()
              break

              case 'fr':
              await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
                $set: {
                  language: 'fr'
                }
              }, { upsert: true }).catch(e => { })
              await interaction?.editReply({ content: `La langue du bot a été modifiée avec succès en français. :flag_fr:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button?.deferUpdate().catch(e => { })
              await col?.stop()
              break

              case 'pt':
              await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
                $set: {
                  language: 'pt'
                }
              }, { upsert: true }).catch(e => { })
              await interaction?.editReply({ content: `Língua do bot definida para Português - Brasil com sucesso. :flag_br:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button?.deferUpdate().catch(e => { })
              await col?.stop()
              break

              case 'ar':
                await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
                  $set: {
                    language: 'ar'
                  }
                }, { upsert: true }).catch(e => { })
                await interaction?.editReply({ content: `تم تغيير لغة البوت بنجاح إلى اللغة العربية: :flag_ps:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
                await button?.deferUpdate().catch(e => { })
                await col?.stop()
                break
              
	case 'zh_TW':
        await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
          $set: {
            language: 'zh_TW'
          }
        }, { upsert: true }).catch(e => { })
        await interaction?.editReply({ content: `機器人成功設為正體中文 :flag_tw:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
        await button?.deferUpdate().catch(e => { })
        await col?.stop()
        break
			  
	case 'it':
        await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
          $set: {
            language: 'it'
          }
        }, { upsert: true }).catch(e => { })
        await interaction?.editReply({ content: `La lingua del bot è stata cambiata in italiano. :flag_it:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
        await button?.deferUpdate().catch(e => { })
        await col?.stop()
        break
			  
        case 'id':
        await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
          $set: {
            language: 'id'
          }
        }, { upsert: true }).catch(e => { })
        await interaction?.editReply({ content: `Bahasa bot dibuat dalam bahasa indonesia. :flag_id:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
        await button?.deferUpdate().catch(e => { })
        await col?.stop()
        break

        case 'es':
        await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
          $set: {
            language: 'es'
          }
        }, { upsert: true }).catch(e => { })
        await interaction?.editReply({ content: `El idioma del bot se cambió con éxito al español. :flag_es:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
        await button?.deferUpdate().catch(e => { })
        await col?.stop()
        break

        case 'ru':
        await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
          $set: {
            language: 'ru'
          }
        }, { upsert: true }).catch(e => { })
        await interaction?.editReply({ content: `Язык бота успешно изменен на русский. :flag_ru:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
        await button?.deferUpdate().catch(e => { })
        await col?.stop()
        break

        case 'de':
          await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
            $set: {
              language: 'de'
            }
          }, { upsert: true }).catch(e => { })
          await interaction?.editReply({ content: `Die Sprache des Bots wurde erfolgreich auf Deutsch geändert. :flag_de:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
          await button?.deferUpdate().catch(e => { })
          await col?.stop()
          break

        case 'ja':
          await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
            $set: {
              language: 'ja'
            }
          }, { upsert: true }).catch(e => { })
          await interaction?.editReply({ content: `言語を日本語に設定しました。 :flag_jp:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
          await button?.deferUpdate().catch(e => { })
          await col?.stop()
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

            await interaction?.editReply({ embeds: [embed], components: [buttons] }).catch(e => { })
          }
        })
      }).catch(e => { })

    } catch (e) {
      const errorNotifer = require("../functions.js")
     errorNotifer(client, interaction, e, lang)
      }
  },
}