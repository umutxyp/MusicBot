const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
  name: "filter",
  description: "Adds audio filter to ongoing music.",
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

      let buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setLabel("3D")
        .setCustomId('3d')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setLabel("Bassboost")
        .setCustomId('bassboost')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setLabel("Echo")
        .setCustomId('echo')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setLabel("Karaoke")
        .setCustomId('karaoke')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setLabel("Nightcore")
        .setCustomId('nightcore')
        .setStyle(ButtonStyle.Secondary)
      )

      let buttons2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Vaporwave")
          .setCustomId('vaporwave')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setLabel("Flanger")
          .setCustomId('flanger')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setLabel("Gate")
          .setCustomId('gate')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setLabel("Haas")
          .setCustomId('haas')
          .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
          .setLabel("Reverse")
          .setCustomId('reverse')
          .setStyle(ButtonStyle.Secondary)
      )

      let buttons3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setLabel("Surround")
        .setCustomId('surround')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setLabel("Mcompand")
        .setCustomId('mcompand')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setLabel("Phaser")
        .setCustomId('phaser')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setLabel("Tremolo")
        .setCustomId('tremolo')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setLabel("Earwax")
        .setCustomId('earwax')
        .setStyle(ButtonStyle.Secondary)
      )

      let embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle("Select a filter.")
      .setTimestamp()
      .setFooter({ text: `MusicMaker ❤️` })
    interaction.reply({ embeds: [embed], components: [buttons, buttons2, buttons3] }).then(async Message => {

      const filter = i => i.user.id === interaction.user.id
      let col = await interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      col.on('collect', async (button) => {
        if (button.user.id !== interaction.user.id) return
        await button.deferUpdate().catch(e => { })
        let filters = ["3d", "bassboost", "echo", "karaoke", "nightcore", "vaporwave", "flanger", "gate", "haas", "reverse", "surround", "mcompand", "phaser", "tremolo", "earwax"]
if(!filters.includes(button.customId)) return

      let filtre = button.customId
      if (!filtre) return interaction.editReply({ content: lang.msg29, ephemeral: true }).catch(e => { })
     filtre = filtre.toLowerCase()
   
      if (filters.includes(filtre.toLowerCase())) {
        if (queue.filters.has(filtre)) {
          queue.filters.remove(filtre)
          embed.setDescription(lang.msg31.replace("{filter}", filtre).replace("{status}", "❌"))
          return interaction.editReply({ embeds: [embed] }).catch(e => { })
        } else {
          queue.filters.add(filtre)
          embed.setDescription(lang.msg31.replace("{filter}", filtre).replace("{status}", "✅"))
          return interaction.editReply({ embeds: [embed] }).catch(e => { })
        }
      } else {
        const filter = filters.find((x) => x.toLowerCase() === filtre.toLowerCase())
        embed.setDescription(lang.msg30.replace("{filters}", filters.map(mr => `\`${mr}\``).join(", ")))
        if (!filter) return interaction.editReply({ embeds: [embed] }).catch(e => { })
      }
    })

    col.on('end', async (button, reason) => {
      if (reason === 'time') {

        embed = new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setTitle("Time ended.")
          .setTimestamp()
          .setFooter({ text: `MusicMaker ❤️` })

        await interaction.editReply({ embeds: [embed], components: [] }).catch(e => { })
      }
    })

    })

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
