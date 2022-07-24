const { QueueRepeatMode } = require('discord-player');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("croxydb");
module.exports = {
  name: "loop",
  description: "Turns the music loop mode on or off.",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {

    const queue = client.player.getQueue(interaction.guild.id);
    let cmds = db.get("loop." + interaction.user.id + interaction.guild.id + interaction.channel.id)
    if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })
    if (cmds) return interaction.reply({ content: `You already have an active command here. ❌\nhttps://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${cmds}`, ephemeral: true }).catch(e => { })

    let button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Loop")
        .setStyle(ButtonStyle.Success)
        .setCustomId("loop"))

    const embed = new EmbedBuilder()
      .setColor("007fff")
      .setTitle('Loop System')
      .setDescription(`**${queue.current.title}** is now looping.`)
      .setTimestamp()
      .setFooter({ text: `Code Share - by Umut Bayraktar ❤️` })
    interaction.reply({ embeds: [embed], components: [button], fetchReply: true }).then(async Message => {
      await db.set("loop." + interaction.user.id + interaction.guild.id + interaction.channel.id, Message.id)
      const filter = i => i.user.id === interaction.user.id
      let col = await interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

      col.on('collect', async (button) => {
        if (button.user.id !== interaction.user.id) return

        switch (button.customId) {
          case 'loop':
            if (queue.repeatMode === 1) return interaction.reply({ content: `You should disable loop mode of existing music first **(/loop)** ❌`, ephemeral: true }).catch(e => { })
            const success = queue.setRepeatMode(queue.repeatMode === 0 ? QueueRepeatMode.QUEUE : QueueRepeatMode.OFF);
            interaction.editReply({ content: success ? `Loop Mode: **${queue.repeatMode === 0 ? 'Inactive' : 'Active'}**, The whole sequence will repeat non-stop 🔁` : `Something went wrong. ❌` }).catch(e => { })
            await button.deferUpdate();
            break
        }
      })
      col.on('end', async (button) => {
        await db.delete("loop." + interaction.user.id + interaction.guild.id + interaction.channel.id)
        button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel("Loop It")
            .setCustomId("loop")
            .setDisabled(true))

        const embed = new EmbedBuilder()
          .setColor("007fff")
          .setTitle('Loop System - Ended')
          .setDescription(`Your time is up to choose.`)
          .setTimestamp()
          .setFooter({ text: `Code Share - by Umut Bayraktar ❤️` })

        await interaction.editReply({ embeds: [embed], components: [button] }).catch(e => { });
      })
    }).catch(e => { })
  }
}
