const db = require("../mongoDB");
module.exports = {
  name: "loop",
  description: "Turns the music loop mode on or off.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {
      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) return interaction.reply({ content: lang.msg5, ephemeral: true }).catch(e => { })
  
      let button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(lang.msg35)
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("queue"),
        new ButtonBuilder()
          .setLabel(lang.msg36)
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("nowplaying"),
        new ButtonBuilder()
          .setLabel(lang.msg37)
          .setStyle(ButtonStyle.Danger)
          .setCustomId("close")
      )

      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle(lang.msg38)
        .setDescription(lang.msg39)
        .setTimestamp()
        .setFooter({ text: `MusicMaker ❤️` })
      interaction?.reply({ embeds: [embed], components: [button], fetchReply: true }).then(async Message => {

        const filter = i => i.user.id === interaction.user.id
        let col = await Message.createMessageComponentCollector({ filter, time: 120000 });

        col.on('collect', async (button) => {
          if (button.user.id !== interaction.user.id) return
          const queue1 = client.player.getQueue(interaction.guild.id);
          if (!queue1 || !queue1.playing) {
            await interaction?.editReply({ content: lang.msg5, ephemeral: true }).catch(e => { })
            await button?.deferUpdate().catch(e => {})
          }
          switch (button.customId) {
            case 'queue':
              const success = queue.setRepeatMode(2);
              interaction?.editReply({ content: `${lang.msg40} ✅` }).catch(e => { })
              await button?.deferUpdate().catch(e => {})
              break
            case 'nowplaying':
              const success2 = queue.setRepeatMode(1);
              interaction?.editReply({ content: `${lang.msg42} ✅` }).catch(e => { })
              await button?.deferUpdate().catch(e => {})
              break
            case 'close':
              if (queue.repeatMode === 0) {
                await button?.deferUpdate().catch(e => {})
                return interaction?.editReply({ content: lang.msg43, ephemeral: true }).catch(e => { })
              }
              const success4 = queue.setRepeatMode(0);
              interaction?.editReply({ content: lang.msg44 }).catch(e => { })
              await button?.deferUpdate().catch(e => {})
              break
          }
        })
        col.on('end', async (button) => {
          button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel(lang.msg45)
              .setCustomId("timeend")
              .setDisabled(true))

          const embed = new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setTitle(lang.msg46)
            .setTimestamp()
            .setFooter({ text: `MusicMaker ❤️` })

          await interaction?.editReply({ content: "", embeds: [embed], components: [button] }).catch(e => { });
        })
      }).catch(e => { })

    } catch (e) {
      const errorNotifer = require("../functions.js")
     errorNotifer(client, interaction, e, lang)
      }
  }
}
